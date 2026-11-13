import { useContext } from 'react'
import { LangContext } from '@/plugins/lang'

// Languages of plugins/lang.tsx: current, availableLanguages, getTranslation, setLang (inside <LangProvider>)
export const useLang = () => useContext(LangContext)!
