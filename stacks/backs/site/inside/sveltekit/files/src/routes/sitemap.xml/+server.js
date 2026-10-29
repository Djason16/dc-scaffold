import { PUBLIC_SITE_URL } from '$app/env/public'

// sitemap.xml written at build time (prerendered) from the pages of src/routes: no route to list by hand.
// Pages with a parameter ([id]) or private (_name) are left out, groups ((name)) do not change the address.
export const prerender = true

const pages = Object.keys(import.meta.glob('/src/routes/**/+page.svelte'))
    .map((file) => file.replace(/^\/src\/routes/, '').replace(/\/\+page\.svelte$/, '').replace(/\/\([^)]+\)/g, ''))
    .filter((route) => !/[[_]/.test(route))
    .map((route) => `${route}/`.replace(/^\/?/, '/').replace(/\/+$/, '/'))

export function GET() {
    const site = (PUBLIC_SITE_URL ?? '').replace(/\/+$/, '')
    const today = new Date().toISOString().slice(0, 10)
    const urls = [...new Set(pages)].sort().map((route) => `  <url><loc>${site}${route}</loc><lastmod>${today}</lastmod></url>`)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
    return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
