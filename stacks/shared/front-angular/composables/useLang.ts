import { inject } from '@angular/core'
import { LangService } from '@/plugins/lang'

// Languages of the site (plugins/lang.ts): the current language and the texts
export const useLang = () => inject(LangService)
