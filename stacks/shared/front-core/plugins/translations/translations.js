import common from './common/common.js'
import preferences from './common/preferences.js'
import seo from './common/seo.js'
import home from './pages/index.js'

/*
 * Languages of the site, the first one is the default.
 * One language = no language buttons. Two or more = buttons at the bottom right of the page.
 * Examples: ['fr'], ['en'], ['fr', 'en']
 */
/** @type {string[]} */
export const LANGUAGES = {{LANGUAGES_JS}}

/*
 * Every translation file. Each one has a block per language, with the same keys:
 *   export default { fr: { heroTitle: 'Bonjour' }, en: { heroTitle: 'Hello' } }
 * A block of a language missing from LANGUAGES is ignored (you can delete it).
 * New file: create it (for example pages/about.js), import it above and add it to this list.
 */
/** @type {Record<string, Record<string, string>>[]} */
export const TRANSLATIONS = [common, preferences, seo, home]

/**
 * Text of a key in a language, with its {{values}} filled in. A missing text shows its key (easy to spot on the page).
 * @param {string} language
 * @param {string} key
 * @param {Record<string, string>} [values]
 * @returns {string}
 */
export const translate = (language, key, values = {}) => {
    const text = TRANSLATIONS.map((file) => file[language]?.[key]).find((found) => found !== undefined) ?? key
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (/** @type {string} */ match, /** @type {string} */ name) => values[name] ?? match)
}
