// Writes sitemap.xml and robots.txt into the built site, after "npm run build".
//   node scripts/sitemap.mjs <build folder> [--pages <pages folder>] [--pages-only] [--to <folder>]
// Pages are the .html files of the build, and the files of --pages when it is given (a single-page app has one
// index.html): index -> /, about -> /about/; [id], _private, layouts, errors and api/ are skipped.
// --pages-only: the pages folder alone (a site without build, whose pages are pieces of HTML).
// Each page comes with its images: the ones of its <main> in the built page, else the ones its file shows from public/.
// A page closed to search engines (<meta name="robots" content="noindex">) stays out.
// The site URL comes from the *SITE_URL variable of .env.production.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

// Private pages (admin, account...): left out of sitemap.xml and forbidden to crawlers in robots.txt, e.g. ['/admin', '/account']
const PRIVATE_ROUTES = []

const [buildDir, ...options] = process.argv.slice(2)
const option = (name) => (options.includes(name) ? options[options.indexOf(name) + 1] : undefined)
const pagesDir = option('--pages')
// Folder that receives sitemap.xml and robots.txt (the build folder by default; a Node.js server serves another one)
if (!buildDir || !existsSync(buildDir)) {
    console.error(`sitemap: build folder not found (${buildDir})`)
    process.exit(1)
}

const readSiteUrl = () => {
    // A qualif gives its own settings file (scripts/qualif.mjs: QUALIF_ENV_FILE=.env.preprod)
    for (const file of [process.env.QUALIF_ENV_FILE, '.env.production', '.env'].filter(Boolean)) {
        if (!existsSync(file)) continue
        const line = readFileSync(file, 'utf8').split(/\r?\n/).find((row) => /^\s*\w*SITE_URL\s*=/.test(row))
        if (line) return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '')
    }
    return ''
}

const walk = (dir) => readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)])

const toRoute = (file, root, extension) => {
    const path = relative(root, file).split(sep).join('/').replace(extension, '').replace(/(^|\/)\+page$/, '$1index')
    const route = path === 'index' ? '' : path.replace(/\/index$/, '')
    return route ? `/${route}/` : '/'
}

// Files of a pages folder that are not pages: parameters, private, layouts, errors, the API, styles and templates
const NOT_A_PAGE = /(^|\/)(\[|_|\+(layout|server|error)|layout\.|(404|500)\.|api\/)|\.(css|scss|spec\.\w+|d\.ts)$/

const fromBuild = () => walk(outDir)
    .filter((file) => file.endsWith('.html'))
    .map((file) => ({ route: toRoute(file, outDir, /\.html$/), html: readFileSync(file, 'utf8') }))
    .filter(({ route, html }) => !/^\/(404|500|200|_)/.test(route) && !/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html))

const fromPages = () => walk(pagesDir)
    .filter((file) => !NOT_A_PAGE.test(relative(pagesDir, file).split(sep).join('/')))
    .map((file) => ({ route: toRoute(file, pagesDir, /\.\w+$/), source: readFileSync(file, 'utf8') }))

const siteUrl = readSiteUrl()
if (!siteUrl) {
    console.warn('sitemap: no *SITE_URL in .env.production, sitemap.xml skipped')
    process.exit(0)
}
const origin = new URL(siteUrl).origin
const sitePath = new URL(siteUrl).pathname.replace(/\/+$/, '')
// A build that puts the site in a folder named like its base (Qwik in a qualif: dist/my-site/) is read from there
const outDir = sitePath && existsSync(join(buildDir, sitePath)) ? join(buildDir, sitePath) : buildDir
const toDir = option('--to') ?? outDir

// Images of a built page: <img> and <picture> of its <main> (the whole page without one)
const IMAGE_TAG = /<(?:img|source)\s[^>]*?\b(?:src|srcset)=["']([^"'\s,]+)/gi
const fromHtml = (html, route) => {
    const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html
    return [...main.matchAll(IMAGE_TAG)].map(([, src]) => src.replaceAll('&amp;', '&'))
        .filter((src) => !src.startsWith('data:'))
        // Written from the root ("/images/..."): inside the folder of the site when it has one (a qualif)
        .map((src) => (/^\/(?!\/)/.test(src) && sitePath && !src.startsWith(`${sitePath}/`) ? `${sitePath}${src}` : src))
        .map((src) => new URL(src, `${origin}${sitePath}${route}`).href)
        .filter((url) => url.startsWith(origin))
}
// Images of a page file: the files of public/ it shows ("/images/hero.jpg"), when the build has them
const IMAGE_PATH = /["'`(]\/([\w\-./]+\.(?:png|jpe?g|webp|avif|gif|svg))(?=["'`)?#])/gi
const fromSource = (source) => [...source.matchAll(IMAGE_PATH)]
    .filter(([, path]) => existsSync(join(outDir, path)))
    .map(([, path]) => `${siteUrl}/${path}`)

const pages = new Map()
for (const { route, html } of options.includes('--pages-only') ? [] : fromBuild()) pages.set(route, fromHtml(html, route))
for (const { route, source } of pagesDir ? fromPages() : []) {
    pages.set(route, [...(pages.get(route) ?? []), ...(pages.has(route) && pages.get(route).length ? [] : fromSource(source))])
}

const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const today = new Date().toISOString().slice(0, 10)
const routes = [...pages.keys()].filter((route) => !PRIVATE_ROUTES.some((path) => route.startsWith(path))).sort()
let imageCount = 0
const urls = routes.map((route) => {
    const images = [...new Set(pages.get(route))]
    imageCount += images.length
    const tags = images.map((url) => `\n    <image:image><image:loc>${escape(url)}</image:loc></image:image>`).join('')
    return `  <url><loc>${escape(siteUrl + route)}</loc><lastmod>${today}</lastmod>${tags}${tags ? '\n  ' : ''}</url>`
})

writeFileSync(join(toDir, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
    + `${urls.join('\n')}\n</urlset>\n`)
// « /admin » without slash at the end: also closes /admin?... (with the slash, Google still crawled the pages with parameters)
const disallow = PRIVATE_ROUTES.map((path) => `Disallow: ${path.replace(/\/+$/, '') || '/'}\n`).join('')
writeFileSync(join(toDir, 'robots.txt'), `User-agent: *\nAllow: /\n${disallow}\nSitemap: ${siteUrl}/sitemap.xml\n`)
console.log(`sitemap: ${routes.length} page(s), ${imageCount} image(s) -> ${toDir}/sitemap.xml, robots.txt`)
