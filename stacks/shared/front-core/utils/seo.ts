import { joinUrl, withTrailingSlash } from './pathHelpers'

/*
 * SEO of each page: title, description, image, Open Graph and JSON-LD for search engines and social networks.
 * @two-languages
 * Add a page: add an entry below (its address and its sharing image, put in the public folder),
 * then its title and description in plugins/translations/common/seo.ts: seo<Page>Title and seo<Page>Description.
 * @end-two-languages
 * @one-language
 * Add a page: add an entry below (its address, its sharing image put in the public folder, its title and description).
 * {{name}} in a title or a description = site name.
 * @end-one-language
 *   keywords: optional    noIndex: true = hidden from search engines (admin, login...)
 */
// A page: its address, its sharing image (in the public folder), its keywords; noIndex: true = hidden from search engines
type SeoPage = {
    path?: string
    image?: string
    keywords?: string
    noIndex?: boolean
    // @one-language
    title?: string
    description?: string
    // @end-one-language
}

export const SEO_PAGES: Record<string, SeoPage> = {
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

const LOCALES: Record<string, string> = { fr: 'fr_FR', en: 'en_US', es: 'es_ES', de: 'de_DE', it: 'it_IT', pt: 'pt_PT' }

// @two-languages
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
// @end-two-languages

type SeoOptions = {
    // key of SEO_PAGES ('index', ...)
    pageKey: string
    // @two-languages
    // getTranslation of the lang plugin
    t: (key: string, values?: Record<string, string>) => string
    // current language ('fr', 'en', ...)
    // @end-two-languages
    // @one-language
    // language of the site ('fr' or 'en')
    // @end-one-language
    locale: string
    // SITE_NAME / SITE_URL of the .env file
    site: { name: string, url: string }
}

// A tag of <head>: <meta name="..." content="..."> or <meta property="..." content="...">
export type MetaTag = { name: string, content: string } | { property: string, content: string }

// @two-languages
export const buildSeo = ({ pageKey, t, locale, site }: SeoOptions) => {
    const page = SEO_PAGES[pageKey] ?? {}
    const vars = { name: site.name }
    const title = t(`seo${capitalize(pageKey)}Title`, vars)
    const description = t(`seo${capitalize(pageKey)}Description`, vars)
    // @end-two-languages
    // @one-language
export const buildSeo = ({ pageKey, locale, site }: SeoOptions) => {
    const page = SEO_PAGES[pageKey] ?? {}
    const title = (page.title ?? '').replaceAll('{{name}}', site.name)
    const description = (page.description ?? '').replaceAll('{{name}}', site.name)
    // @end-one-language
    const url = withTrailingSlash(joinUrl(site.url, page.path ?? '/'))
    const image = joinUrl(site.url, page.image ?? SEO_PAGES['index']?.image ?? '/og-image.jpg')
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
            // Tells tools like Wappalyzer the site was made with DC Scaffold; remove this line to hide it
            { name: 'generator', content: 'DC Scaffold' },
        ] as MetaTag[],
        link: [{ rel: 'canonical' as const, href: url }],
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
