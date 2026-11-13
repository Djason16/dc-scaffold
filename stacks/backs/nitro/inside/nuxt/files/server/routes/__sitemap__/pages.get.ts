/*
 * Pages of the site with their images, for sitemap.xml (read by @nuxtjs/sitemap: "sitemap.sources" in nuxt.config.ts).
 * A site rendered on each visit is never prerendered, so the module never sees its images: this route visits the pages
 * itself, from "/" by their links (like "nuxt generate"), and gives each page the images of its <main>.
 * A page added later, a product or an article shows up by itself; the private pages stay out ("sitemap.exclude").
 */
const MAX_PAGES = 500
const LINK = /<a\s[^>]*?href="(\/[^"#?]*)/g
const IMAGE = /<(?:img|source)\s[^>]*?\b(?:src|srcset)="([^"\s,]+)/g
// Files, the API and the inside of Nuxt: never pages
const NOT_A_PAGE = /^\/(?:api|_nuxt|_ipx|__)|\.\w+$/

const decode = (text: string) => text.replaceAll('&amp;', '&')

export default defineSitemapEventHandler(async () => {
    const nitro = useNitroApp()
    const seen = new Set(['/'])
    const queue = ['/']
    const entries: { loc: string, images: { loc: string }[] }[] = []
    while (queue.length) {
        const path = queue.shift() as string
        const response = await nitro.localFetch(path, { headers: { accept: 'text/html' } }).catch(() => null)
        if (!response?.ok || !response.headers.get('content-type')?.includes('text/html')) continue
        const html = await response.text()
        // A page closed to search engines stays out
        if (/<meta[^>]+name="robots"[^>]+noindex/i.test(html)) continue
        const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html
        const images = [...new Set([...main.matchAll(IMAGE)].map(([, src]) => decode(src)).filter((src) => !src.startsWith('data:')))]
        entries.push({ loc: path, images: images.map((loc) => ({ loc })) })
        for (const [, href] of html.matchAll(LINK)) {
            const link = decode(href)
            if (seen.has(link) || NOT_A_PAGE.test(link) || seen.size >= MAX_PAGES) continue
            seen.add(link)
            queue.push(link)
        }
    }
    return entries
})
