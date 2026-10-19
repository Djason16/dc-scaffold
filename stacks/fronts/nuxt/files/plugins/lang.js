import { ref } from 'vue'
import { LANGUAGES, translate } from './translations/translations.js'

/*
 * Languages of the site: $lang in every component.
 *   Template:  {{ $lang.getTranslation('heroTitle') }}
 *   Script:    const lang = useLang()   then   lang.getTranslation('heroTitle', { name: 'Site' })
 * Texts: plugins/translations/. Languages of the site: plugins/translations/translations.js.
 */
// @two-languages
const STORAGE_KEY = 'selectedLanguage'
// @end-two-languages

export default defineNuxtPlugin(() => {
    // Current language: the first one of LANGUAGES until the visitor changes it
    const current = ref(LANGUAGES[0])

    const lang = {
        current,
        availableLanguages: LANGUAGES,

        // Text of a key in the current language ("{{name}}" in the text is replaced by values.name)
        getTranslation: (key, values) => translate(current.value, key, values),

        // @two-languages
        // remember = keep the language for the next visit (only allowed with functional cookies)
        setLang(code, remember = false) {
            if (!code || !LANGUAGES.includes(code)) return
            current.value = code
            if (remember) localStorage.setItem(STORAGE_KEY, code)
        },

        // Language kept during a previous visit
        restore() {
            lang.setLang(localStorage.getItem(STORAGE_KEY))
        },
        // @end-two-languages
    }

    // <html lang="..."> follows the current language
    useHead({ htmlAttrs: { lang: current } })

    return { provide: { lang } }
})
