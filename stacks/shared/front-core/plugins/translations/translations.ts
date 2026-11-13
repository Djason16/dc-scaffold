import common from './common/common'
import preferences from './common/preferences'
import seo from './common/seo'
import home from './pages/index'

/*
 * Languages of the site, the first one is the default.
 * One language = no language buttons. Two or more = buttons at the bottom right of the page.
 * Examples: ['fr'], ['en'], ['fr', 'en']
 */
export const LANGUAGES: string[] = {{LANGUAGES_JS}}

/*
 * Every translation file. Each one has a block per language, with the same keys:
 *   export default { fr: { heroTitle: 'Bonjour' }, en: { heroTitle: 'Hello' } }
 * A block of a language missing from LANGUAGES is ignored (you can delete it).
 * New file: create it (for example pages/about.ts), import it above and add it to this list.
 */
export const TRANSLATIONS: Record<string, Record<string, string>>[] = [common, preferences, seo, home]

/**
 * Text of a key in a language, with its {{values}} filled in. A missing text shows its key (easy to spot on the page).
 */
export const translate = (language: string, key: string, values: Record<string, string> = {}): string => {
    const text = TRANSLATIONS.map((file) => file[language]?.[key]).find((found) => found !== undefined) ?? key
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match: string, name: string) => values[name] ?? match)
}
