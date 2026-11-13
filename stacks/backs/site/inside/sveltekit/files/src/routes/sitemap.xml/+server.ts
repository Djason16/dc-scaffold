import { PUBLIC_SITE_URL } from '$app/env/public'

// sitemap.xml written at build time (prerendered) from the pages of src/routes: no route to list by hand.
// Pages with a parameter ([id]) or private (_name) are left out, groups ((name)) do not change the address.
// Each page comes with the images it shows from static/ ("/images/hero.jpg").
export const prerender = true

const sources = import.meta.glob('/src/routes/**/+page.svelte', { query: '?raw', import: 'default', eager: true })
const IMAGE_PATH = /["'`(]\/([\w\-./]+\.(?:png|jpe?g|webp|avif|gif|svg))(?=["'`)?#])/gi

const pages = Object.entries(sources)
    .map(([file, source]) => ({
        route: `${file.replace(/^\/src\/routes/, '').replace(/\/\+page\.svelte$/, '').replace(/\/\([^)]+\)/g, '')}/`.replace(/^\/?/, '/').replace(/\/+$/, '/'),
        images: [...new Set([...String(source).matchAll(IMAGE_PATH)].map(([, path]) => path))],
    }))
    .filter(({ route }) => !/[[_]/.test(route))

const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

export function GET() {
    const site = (PUBLIC_SITE_URL ?? '').replace(/\/+$/, '')
    const today = new Date().toISOString().slice(0, 10)
    const urls = pages.sort((a, b) => a.route.localeCompare(b.route)).map(({ route, images }) => {
        const tags = images.map((path) => `\n    <image:image><image:loc>${escape(`${site}/${path}`)}</image:loc></image:image>`).join('')
        return `  <url><loc>${escape(site + route)}</loc><lastmod>${today}</lastmod>${tags}${tags ? '\n  ' : ''}</url>`
    })
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
        + `${urls.join('\n')}\n</urlset>\n`
    return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
