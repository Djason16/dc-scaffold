import { createContext, createSignal, type ParentProps } from 'solid-js'
import { LANGUAGES, translate } from './translations/translations'

/*
 * Languages of the site, for every component inside <LangProvider>.
 *   const lang = useLang()   then   lang.getTranslation('heroTitle', { name: 'Site' })
 * Texts: plugins/translations/. Languages of the site: plugins/translations/translations.ts.
 */
// @two-languages
const STORAGE_KEY = 'selectedLanguage'
// @end-two-languages

// What useLang() gives
export type Lang = {
    readonly current: string
    availableLanguages: string[]
    getTranslation: (key: string, values?: Record<string, string>) => string
    // @two-languages
    setLang: (code: string | null, remember?: boolean) => void
    restore: () => void
    // @end-two-languages
}

export const LangContext = createContext<Lang>()

export function LangProvider(props: ParentProps) {
    // Current language: the first one of LANGUAGES until the visitor changes it
    const [current, setCurrent] = createSignal<string>(LANGUAGES[0]!)

    // @two-languages
    // remember = keep the language for the next visit (only allowed with functional cookies)
    const setLang = (code: string | null, remember = false) => {
        if (!code || !LANGUAGES.includes(code)) return
        setCurrent(code)
        document.documentElement.lang = code
        if (remember) localStorage.setItem(STORAGE_KEY, code)
    }
    // @end-two-languages

    const lang: Lang = {
        get current() {
            return current()
        },
        availableLanguages: LANGUAGES,
        // Text of a key in the current language ("{{name}}" in the text is replaced by values.name)
        getTranslation: (key, values) => translate(current(), key, values),
        // @two-languages
        setLang,
        // Language kept during a previous visit
        restore: () => setLang(localStorage.getItem(STORAGE_KEY)),
        // @end-two-languages
    }

    return <LangContext.Provider value={lang}>{props.children}</LangContext.Provider>
}
