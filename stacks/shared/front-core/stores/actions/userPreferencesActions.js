/*
 * Actions of the userPreferences store (stores/userPreferences.js): read and save the visitor's choice in a cookie.
 * Nothing to change here to add a category: the actions use the "categories" of the store.
 */

/**
 * @typedef {object} UserPreferencesState
 * @property {boolean} hasUserMadeChoice
 * @property {Record<string, boolean>} preferences
 * @property {Record<string, { required: boolean }>} categories
 */
/** @typedef {UserPreferencesState & { savePreferences(chosen?: Record<string, boolean>): void, resetPreferences(): void }} UserPreferencesStore */

// Name of the cookie holding the choice, and how long it is kept
const COOKIE_NAME = '{{SLUG}}_user_prefs'
const EXPIRES_IN_DAYS = 180

// Saved in the browser only with the "functional" consent: deleted when it is refused
// @two-languages
const FUNCTIONAL_STORAGE_KEYS = ['selectedLanguage']
// @end-two-languages
// @one-language
/** @type {string[]} */
const FUNCTIONAL_STORAGE_KEYS = []
// @end-one-language

// Cookies only exist in the browser (not while the server renders the page)
const inBrowser = () => typeof document !== 'undefined'

const readCookie = () => {
    const cookie = document.cookie.split('; ').find((part) => part.startsWith(`${COOKIE_NAME}=`))
    return cookie ? decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1)) : null
}

/** @param {string} value */
const writeCookie = (value) => {
    const expires = new Date(Date.now() + EXPIRES_IN_DAYS * 864e5).toUTCString()
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

/**
 * Required categories always on, the other ones as chosen (not chosen = off)
 * @param {Record<string, { required: boolean }>} categories
 * @param {Record<string, boolean>} [chosen]
 * @returns {Record<string, boolean>}
 */
const cleanPreferences = (categories, chosen = {}) =>
    Object.fromEntries(Object.entries(categories).map(([name, category]) => [name, category.required || chosen[name] === true]))

// "this" is the store: this.preferences, this.categories, this.hasUserMadeChoice
export const userPreferencesActions = {
    // Reads the cookie; true when the visitor already chose (the banner stays hidden)
    /** @this {UserPreferencesStore} */
    loadPreferences() {
        if (!inBrowser()) return false
        try {
            const saved = readCookie()
            if (!saved) return false
            this.preferences = cleanPreferences(this.categories, JSON.parse(saved))
            this.hasUserMadeChoice = true
            return true
        } catch {
            this.resetPreferences()
            return false
        }
    },

    // Saves a choice, for example { functional: true } (required categories are added automatically)
    /**
     * @this {UserPreferencesStore}
     * @param {Record<string, boolean>} [chosen]
     */
    savePreferences(chosen) {
        if (!inBrowser()) return
        this.preferences = cleanPreferences(this.categories, chosen)
        this.hasUserMadeChoice = true
        writeCookie(JSON.stringify(this.preferences))
        if (!this.preferences.functional) FUNCTIONAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
    },

    // Every category on
    /** @this {UserPreferencesStore} */
    acceptAll() {
        this.savePreferences(Object.fromEntries(Object.keys(this.categories).map((name) => [name, true])))
    },

    // Only the required categories
    /** @this {UserPreferencesStore} */
    denyAll() {
        this.savePreferences({})
    },

    // Back to the default choice: the banner shows again
    /** @this {UserPreferencesStore} */
    resetPreferences() {
        this.preferences = cleanPreferences(this.categories)
        this.hasUserMadeChoice = false
    },

    // Forgets the choice (e.g. a "Cookie settings" link in the footer): the banner shows again
    /** @this {UserPreferencesStore} */
    deleteCookie() {
        if (!inBrowser()) return
        document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
        this.resetPreferences()
    },
}
