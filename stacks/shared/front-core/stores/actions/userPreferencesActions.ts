/*
 * Actions of the userPreferences store (stores/userPreferences.ts): read and save the visitor's choice in a cookie.
 * Nothing to change here to add a category: the actions use the "categories" of the store.
 */

// The store the actions work on ("this")
type UserPreferencesStore = {
    hasUserMadeChoice: boolean
    preferences: Record<string, boolean>
    categories: Record<string, { required: boolean }>
    savePreferences(chosen?: Record<string, boolean>): void
    resetPreferences(): void
}

// Name of the cookie holding the choice, and how long it is kept
const COOKIE_NAME = '{{SLUG}}_user_prefs'
const EXPIRES_IN_DAYS = 180

// Saved in the browser only with the "functional" consent: deleted when it is refused
// @two-languages
const FUNCTIONAL_STORAGE_KEYS = ['selectedLanguage']
// @end-two-languages
// @one-language
const FUNCTIONAL_STORAGE_KEYS: string[] = []
// @end-one-language

// Cookies only exist in the browser (not while the server renders the page)
const inBrowser = () => typeof document !== 'undefined'

const readCookie = () => {
    const cookie = document.cookie.split('; ').find((part) => part.startsWith(`${COOKIE_NAME}=`))
    return cookie ? decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1)) : null
}

const writeCookie = (value: string) => {
    const expires = new Date(Date.now() + EXPIRES_IN_DAYS * 864e5).toUTCString()
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

// Required categories always on, the other ones as chosen (not chosen = off)
const cleanPreferences = (categories: Record<string, { required: boolean }>, chosen: Record<string, boolean> = {}): Record<string, boolean> =>
    Object.fromEntries(Object.entries(categories).map(([name, category]) => [name, category.required || chosen[name] === true]))

// "this" is the store: this.preferences, this.categories, this.hasUserMadeChoice
export const userPreferencesActions = {
    // Reads the cookie; true when the visitor already chose (the banner stays hidden)
    loadPreferences(this: UserPreferencesStore) {
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
    savePreferences(this: UserPreferencesStore, chosen: Record<string, boolean> = {}) {
        if (!inBrowser()) return
        this.preferences = cleanPreferences(this.categories, chosen)
        this.hasUserMadeChoice = true
        writeCookie(JSON.stringify(this.preferences))
        if (!this.preferences['functional']) FUNCTIONAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
    },

    // Every category on
    acceptAll(this: UserPreferencesStore) {
        this.savePreferences(Object.fromEntries(Object.keys(this.categories).map((name) => [name, true])))
    },

    // Only the required categories
    denyAll(this: UserPreferencesStore) {
        this.savePreferences({})
    },

    // Back to the default choice: the banner shows again
    resetPreferences(this: UserPreferencesStore) {
        this.preferences = cleanPreferences(this.categories)
        this.hasUserMadeChoice = false
    },

    // Shows the banner again on the current choice ("Cookie settings" in the footer): the cookie stays until the visitor chooses again
    openSettings(this: UserPreferencesStore) {
        this.hasUserMadeChoice = false
    },

    // Forgets the choice: the banner shows again, every optional category off
    deleteCookie(this: UserPreferencesStore) {
        if (!inBrowser()) return
        document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
        this.resetPreferences()
    },
}
