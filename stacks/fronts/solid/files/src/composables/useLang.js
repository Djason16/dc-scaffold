import { useContext } from 'solid-js'
import { LangContext } from '@/plugins/lang.jsx'

// Languages of plugins/lang.jsx: current, availableLanguages, getTranslation, setLang
export const useLang = () => useContext(LangContext)
