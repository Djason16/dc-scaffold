import { Injectable, signal } from '@angular/core'
import { LANGUAGES, translate } from './translations/translations.js'

/*
 * Languages of the site, for every component:
 *   protected lang = useLang()   then in the template   {{ lang.getTranslation('heroTitle', { name: 'Site' }) }}
 * Texts: plugins/translations/. Languages of the site: plugins/translations/translations.js.
 */
// @two-languages
const STORAGE_KEY = 'selectedLanguage'
// @end-two-languages

@Injectable({ providedIn: 'root' })
export class LangService {
    // Current language: the first one of LANGUAGES until the visitor changes it
    readonly current = signal(LANGUAGES[0])
    readonly availableLanguages = LANGUAGES

    // Text of a key in the current language ("{{name}}" in the text is replaced by values.name)
    getTranslation(key: string, values?: Record<string, string>): string {
        return translate(this.current(), key, values)
    }
    // @two-languages

    // remember = keep the language for the next visit (only allowed with functional cookies)
    setLang(code: string | null, remember = false) {
        if (!code || !LANGUAGES.includes(code)) return
        this.current.set(code)
        document.documentElement.lang = code
        if (remember) localStorage.setItem(STORAGE_KEY, code)
    }

    // Language kept during a previous visit
    restore() {
        this.setLang(localStorage.getItem(STORAGE_KEY))
    }
    // @end-two-languages
}
