import { inject } from 'vue'
import type { Lang } from '@/plugins/lang'

// Languages of plugins/lang.ts in a script: current, availableLanguages, getTranslation, setLang
export const useLang = () => inject<Lang>('lang')!
