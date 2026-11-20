import { createContext, useContext } from 'react'

// What useLang() gives (filled by <LangProvider> of plugins/lang.tsx)
export type Lang = {
    current: string
    availableLanguages: string[]
    getTranslation: (key: string, values?: Record<string, string>) => string
    // @two-languages
    setLang: (code: string | null, remember?: boolean) => void
    restore: () => void
    // @end-two-languages
}

// Kept here, not in plugins/lang.tsx: a file of components only exports components (React Fast Refresh)
export const LangContext = createContext<Lang | null>(null)

// Languages of plugins/lang.tsx: current, availableLanguages, getTranslation, setLang (inside <LangProvider>)
export const useLang = () => useContext(LangContext)!