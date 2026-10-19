import { joinUrl, withTrailingSlash } from './pathHelpers.js'

/*
 * SEO of each page: title, description, image, Open Graph and JSON-LD for search engines and social networks.
 * @two-languages
 * Add a page: add an entry below (its address and its sharing image, put in the public folder),
 * then its title and description in plugins/translations/common/seo.js: seo<Page>Title and seo<Page>Description.
 * @end-two-languages
 * @one-language
 * Add a page: add an entry below (its address, its sharing image put in the public folder, its title and description).
 * {{name}} in a title or a description = site name.
 * @end-one-language
 *   keywords: optional    noIndex: true = hidden from search engines (admin, login...)
 */
/**
 * @typedef {object} SeoPage
 * @property {string} [path]       address of the page
 * @property {string} [image]      sharing image, in the public folder
 * @property {string} [keywords]
 * @property {boolean} [noIndex]   true = hidden from search engines
 * @one-language
 * @property {string} [title]
 * @property {string} [description]
 * @end-one-language
 */

/** @type {Record<string, SeoPage>} */
export const SEO_PAGES = {
    // @two-languages
    index: { path: '/', image: '/og-image.jpg' },
    // about: { path: '/about', image: '/og-image.jpg', keywords: 'web, design' },
    notFound: { path: '/404', noIndex: true },
    // @end-two-languages
    // @one-language
    index: { path: '/', image: '/og-image.jpg', title: '{{TEXT_JS:seoIndexTitle}}', description: '{{TEXT_JS:seoIndexDescription}}' },
    // about: { path: '/about', image: '/og-image.jpg', title: 'About', description: 'Who we are', keywords: 'web, design' },
    notFound: { path: '/404', noIndex: true, title: '{{TEXT_JS:seoNotFoundTitle}}', description: '{{TEXT_JS:seoNotFoundDescription}}' },
    // @end-one-language
}

/** @type {Record<string, string>} */
const LOCALES = { fr: 'fr_FR', en: 'en_US', es: 'es_ES', de: 'de_DE', it: 'it_IT', pt: 'pt_PT' }

// @two-languages
/** @param {string} text */
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)
// @end-two-languages

/**
 * @param {object} options
 * @param {string} options.pageKey  key of SEO_PAGES ('index', ...)
 * @two-languages
 * @param {(key: string, values?: Record<string, string>) => string} options.t  getTranslation of the lang plugin
 * @end-two-languages
 * @two-languages
 * @param {string} options.locale   current language ('fr', 'en', ...)
 * @end-two-languages
 * @one-language
 * @param {string} options.locale   language of the site ('fr' or 'en')
 * @end-one-language
 * @param {{ name: string, url: string }} options.site  SITE_NAME / SITE_URL of the .env file
 */
// @two-languages
export const buildSeo = ({ pageKey, t, locale, site }) => {
    const page = SEO_PAGES[pageKey] ?? {}
    const vars = { name: site.name }
    const title = t(`seo${capitalize(pageKey)}Title`, vars)
    const description = t(`seo${capitalize(pageKey)}Description`, vars)
    // @end-two-languages
    // @one-language
export const buildSeo = ({ pageKey, locale, site }) => {
    const page = SEO_PAGES[pageKey] ?? {}
    const title = (page.title ?? '').replaceAll('{{name}}', site.name)
    const description = (page.description ?? '').replaceAll('{{name}}', site.name)
    // @end-one-language
    const url = withTrailingSlash(joinUrl(site.url, page.path ?? '/'))
    const image = joinUrl(site.url, page.image ?? SEO_PAGES.index.image ?? '/og-image.jpg')
    const robots = page.noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'

    return {
        title,
        description,
        url,
        meta: [
            { name: 'description', content: description },
            { name: 'robots', content: robots },
            ...(page.keywords ? [{ name: 'keywords', content: page.keywords }] : []),
            { property: 'og:type', content: 'website' },
            { property: 'og:site_name', content: site.name },
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: url },
            { property: 'og:image', content: image },
            { property: 'og:locale', content: LOCALES[locale] ?? locale },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: description },
            { name: 'twitter:image', content: image },
        ],
        link: [{ rel: 'canonical', href: url }],
        jsonLd: page.noIndex ? null : {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description,
            url,
            inLanguage: locale,
            isPartOf: { '@type': 'WebSite', name: site.name, url: withTrailingSlash(site.url) },
        },
    }
}
