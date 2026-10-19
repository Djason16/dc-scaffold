import { createContext, useState } from 'react'
import { LANGUAGES, translate } from './translations/translations.js'

/*
 * Languages of the site, for every component inside <LangProvider>.
 *   const lang = useLang()   then   lang.getTranslation('heroTitle', { name: 'Site' })
 * Texts: plugins/translations/. Languages of the site: plugins/translations/translations.js.
 */
// @two-languages
const STORAGE_KEY = 'selectedLanguage'
// @end-two-languages

export const LangContext = createContext(null)

export function LangProvider({ children }) {
    // Current language: the first one of LANGUAGES until the visitor changes it
    const [current, setCurrent] = useState(LANGUAGES[0])

    // @two-languages
    // remember = keep the language for the next visit (only allowed with functional cookies)
    const setLang = (code, remember = false) => {
        if (!code || !LANGUAGES.includes(code)) return
        setCurrent(code)
        document.documentElement.lang = code
        if (remember) localStorage.setItem(STORAGE_KEY, code)
    }
    // @end-two-languages

    const lang = {
        current,
        availableLanguages: LANGUAGES,
        // Text of a key in the current language ("{{name}}" in the text is replaced by values.name)
        getTranslation: (key, values) => translate(current, key, values),
        // @two-languages
        setLang,
        // Language kept during a previous visit
        restore: () => setLang(localStorage.getItem(STORAGE_KEY)),
        // @end-two-languages
    }

    return <LangContext.Provider value={lang}>{children}</LangContext.Provider>
}
