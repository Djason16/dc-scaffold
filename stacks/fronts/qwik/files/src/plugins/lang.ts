import { createContextId, useContextProvider, useStore } from '@builder.io/qwik'
import { LANGUAGES, translate } from './translations/translations.js'

/*
 * Languages of the site, for every component (given by src/root.tsx).
 *   const lang = useLang()   then   t(lang, 'heroTitle', { name: 'Site' })
 * (lang is the store of the language, not a function: Qwik can send it from the built page to the browser)
 * Texts: plugins/translations/. Languages of the site: plugins/translations/translations.js.
 */
// @two-languages
const STORAGE_KEY = 'selectedLanguage'
// @end-two-languages

export type LangState = { current: string }
export const LangContext = createContextId<LangState>('lang')

// Text of a key in the current language ("{{name}}" in the text is replaced by values.name)
export const t = (lang: LangState, key: string, values?: Record<string, string>) => translate(lang.current, key, values)

// Current language: the first one of LANGUAGES until the visitor changes it (called once, by src/root.tsx)
export const useLangProvider = () => {
    useContextProvider(LangContext, useStore<LangState>({ current: LANGUAGES[0] }))
}

// @two-languages
// remember = keep the language for the next visit (only allowed with functional cookies)
export const setLang = (lang: LangState, code: string | null, remember = false) => {
    if (!code || !LANGUAGES.includes(code)) return
    lang.current = code
    document.documentElement.lang = code
    if (remember) localStorage.setItem(STORAGE_KEY, code)
}

// Language kept during a previous visit
export const restoreLang = (lang: LangState) => setLang(lang, localStorage.getItem(STORAGE_KEY))
// @end-two-languages
