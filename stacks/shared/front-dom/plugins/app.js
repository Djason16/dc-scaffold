import { mountBackToTop } from '../components/ui/Button/backToTop.js'
// @two-languages
import { mountChangeLanguageButton } from '../components/ui/Button/changeLanguageButton.js'
// @end-two-languages
import { mountPreferencesBanner } from '../components/ui/PreferencesBanner/preferencesBanner.js'
import { userPreferences } from '../stores/userPreferences.js'
import { applyHead } from '../utils/head.js'
import { buildSeo } from '../utils/seo.js'
import { lang, translatePage } from './lang.js'

/**
 * Starts a page: what the plugins and the AppShell do in the other fronts.
 * @two-languages
 * The page marks where things go: data-language-switcher, data-back-to-top, data-preferences-banner,
 * @end-two-languages
 * @one-language
 * The page marks where things go: data-back-to-top, data-preferences-banner,
 * @end-one-language
 * data-preferences-settings (button that opens the banner again), data-site-name, data-year, data-loader.
 * @param {object} options
 * @param {{ name: string, url: string }} options.site   composables/useSite.js
 * @param {string} [options.pageKey]   key of SEO_PAGES (utils/seo.js), by default <body data-page="...">
 * @param {Function[]} [options.guards]   middleware: (url) => nothing to continue, or a path to redirect
 */
export const startApp = ({ site, pageKey = document.body.dataset.page || 'index', guards = [] }) => {
    for (const guard of guards) {
        const target = guard(new URL(location.href))
        if (target) return location.replace(target)
    }

    // @two-languages
    // {{name}} = site name in every text
    lang.setDefaultValues({ name: site.name })
    // @end-two-languages

    // Choice saved during a previous visit (cookie)
    userPreferences.loadPreferences()

    // @two-languages
    // <head> (title, description...) now and after every language change
    const updateHead = () => applyHead(buildSeo({ pageKey, t: lang.getTranslation, locale: lang.current, site }))
    lang.onChange(updateHead)
    // @end-two-languages
    // @one-language
    // <head> of the page: title, description...
    const updateHead = () => applyHead(buildSeo({ pageKey, locale: '{{DEFAULT_LANG}}', site }))
    // @end-one-language

    // @two-languages
    // Language of a previous visit, only if the visitor accepted functional cookies
    if (userPreferences.preferences.functional) lang.restore()
    translatePage()
    // @end-two-languages
    updateHead()

    // Site name and current year (header, footer)
    document.querySelectorAll('[data-site-name]').forEach((element) => { element.textContent = site.name })
    document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = new Date().getFullYear() })

    // Buttons and banner
    // @two-languages
    document.querySelectorAll('[data-language-switcher]').forEach(mountChangeLanguageButton)
    // @end-two-languages
    document.querySelectorAll('[data-back-to-top]').forEach(mountBackToTop)
    document.querySelectorAll('[data-preferences-banner]').forEach(mountPreferencesBanner)
    document.querySelectorAll('[data-preferences-settings]').forEach((button) => {
        // Forgets the choice: the cookie banner shows again
        button.addEventListener('click', () => userPreferences.deleteCookie())
    })

    // Fonts of utils/fonts.css loaded: the text will not change size, the loader can go
    document.fonts.ready.then(() => document.querySelectorAll('[data-loader]').forEach((loader) => loader.remove()))
}
