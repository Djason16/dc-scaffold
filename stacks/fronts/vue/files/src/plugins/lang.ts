import { ref, watch, type App, type Ref } from 'vue'
import { LANGUAGES, translate } from './translations/translations'

/*
 * Languages of the site: $lang in every template, useLang() in a script.
 *   Template:  {{ $lang.getTranslation('heroTitle') }}
 *   Script:    const lang = useLang()   then   lang.getTranslation('heroTitle', { name: 'Site' })
 * Texts: plugins/translations/. Languages of the site: plugins/translations/translations.ts.
 */
// @two-languages
const STORAGE_KEY = 'selectedLanguage'
// @end-two-languages

// What useLang() and $lang give
export type Lang = {
    current: Ref<string>
    availableLanguages: string[]
    getTranslation: (key: string, values?: Record<string, string>) => string
    // @two-languages
    setLang: (code: string | null, remember?: boolean) => void
    restore: () => void
    // @end-two-languages
}

// $lang in the templates, known by the editor
declare module 'vue' {
    interface ComponentCustomProperties {
        $lang: Lang
    }
}

export default {
    install(app: App) {
        // Current language: the first one of LANGUAGES until the visitor changes it
        const current = ref<string>(LANGUAGES[0]!)

        const lang: Lang = {
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
        watch(current, (code) => { document.documentElement.lang = code }, { immediate: true })

        app.provide('lang', lang)
        app.config.globalProperties.$lang = lang
    },
}
