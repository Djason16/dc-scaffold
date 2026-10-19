import { LANGUAGES, translate } from './translations/translations.js'

/*
 * Languages of the site. Texts are marked in the HTML and replaced when the language changes:
 *   <h1 data-i18n="heroTitle"></h1>                      text of the element
 *   <img data-i18n-attr="alt:logoAlt;title:logoTitle">   attributes ("attribute:key", separated by ";")
 * In a script:  lang.getTranslation('heroTitle', { name: 'Site' })
 * Texts: plugins/translations/. Languages of the site: plugins/translations/translations.js.
 */
// @two-languages
const STORAGE_KEY = 'selectedLanguage'
// @end-two-languages

// Current language: the first one of LANGUAGES until the visitor changes it
let current = LANGUAGES[0]

// Values available in every text, such as {{name}} = site name (set by plugins/app.js)
let defaultValues = {}

// Functions called after every language change (buttons, banner, <head>)
const listeners = []

// Replaces the text of every marked element of the page
export const translatePage = () => {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        element.textContent = lang.getTranslation(element.dataset.i18n)
    })
    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
        for (const pair of element.dataset.i18nAttr.split(';')) {
            const [attribute, key] = pair.split(':').map((part) => part.trim())
            element.setAttribute(attribute, lang.getTranslation(key))
        }
    })
}

export const lang = {
    get current() {
        return current
    },
    availableLanguages: LANGUAGES,

    // Text of a key in the current language ("{{name}}" in the text is replaced by values.name)
    getTranslation: (key, values = {}) => translate(current, key, { ...defaultValues, ...values }),

    // @two-languages
    // remember = keep the language for the next visit (only allowed with functional cookies)
    setLang(code, remember = false) {
        if (!code || !LANGUAGES.includes(code)) return
        current = code
        document.documentElement.lang = code
        if (remember) localStorage.setItem(STORAGE_KEY, code)
        translatePage()
        listeners.forEach((listener) => listener())
    },

    // Language kept during a previous visit
    restore() {
        lang.setLang(localStorage.getItem(STORAGE_KEY))
    },
    // @end-two-languages

    setDefaultValues(values) {
        defaultValues = values
    },

    // Calls a function after every language change
    onChange(listener) {
        listeners.push(listener)
    },
}
