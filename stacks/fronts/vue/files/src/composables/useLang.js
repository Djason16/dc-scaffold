import { inject } from 'vue'

// Languages of plugins/lang.js in a script: current, availableLanguages, getTranslation, setLang
export const useLang = () => inject('lang')
