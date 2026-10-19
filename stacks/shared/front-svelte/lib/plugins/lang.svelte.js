import { LANGUAGES, translate } from '#lib/plugins/translations/translations.js'

/*
 * Languages of the site.
 *   import { lang } from '#lib/plugins/lang.svelte.js'   then   {lang.getTranslation('heroTitle')}
 * Texts: src/lib/plugins/translations/. Languages of the site: plugins/translations/translations.js.
 */
// @two-languages
const STORAGE_KEY = 'selectedLanguage'
// @end-two-languages

// Current language: the first one of LANGUAGES until the visitor changes it
let current = $state(LANGUAGES[0])

export const lang = {
    get current() {
        return current
    },
    availableLanguages: LANGUAGES,

    /**
     * Text of a key in the current language ("{{name}}" in the text is replaced by values.name)
     * @param {string} key
     * @param {Record<string, string>} [values]
     */
    getTranslation: (key, values) => translate(current, key, values),

    // @two-languages
    /**
     * remember = keep the language for the next visit (only allowed with functional cookies)
     * @param {string | null} code
     */
    setLang(code, remember = false) {
        if (!code || !LANGUAGES.includes(code)) return
        current = code
        document.documentElement.lang = code
        if (remember) localStorage.setItem(STORAGE_KEY, code)
    },

    // Language kept during a previous visit
    restore() {
        lang.setLang(localStorage.getItem(STORAGE_KEY))
    },
    // @end-two-languages
}
