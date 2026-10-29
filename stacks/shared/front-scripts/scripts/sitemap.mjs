// Writes sitemap.xml and robots.txt into the built site, after "npm run build".
//   node scripts/sitemap.mjs <build folder> [--pages <pages folder>] [--to <folder>]
// Pages are the .html files of the build; a single-page app (one index.html) gives --pages instead,
// whose files become the routes (index -> /, about -> /about/, [id] and _private are skipped).
// The site URL comes from the *SITE_URL variable of .env.production.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const [outDir, ...options] = process.argv.slice(2)
const option = (name) => (options.includes(name) ? options[options.indexOf(name) + 1] : undefined)
const pagesDir = option('--pages')
// Folder that receives sitemap.xml and robots.txt (the build folder by default; a Node.js server serves another one)
const toDir = option('--to') ?? outDir
if (!outDir || !existsSync(outDir)) {
    console.error(`sitemap: build folder not found (${outDir})`)
    process.exit(1)
}

const readSiteUrl = () => {
    for (const file of ['.env.production', '.env']) {
        if (!existsSync(file)) continue
        const line = readFileSync(file, 'utf8').split(/\r?\n/).find((row) => /^\s*\w*SITE_URL\s*=/.test(row))
        if (line) return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '')
    }
    return ''
}

const walk = (dir) => readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)])

const toRoute = (file, root, extension) => {
    const path = relative(root, file).split(sep).join('/').replace(extension, '')
    const route = path === 'index' ? '' : path.replace(/\/index$/, '')
    return route ? `/${route}/` : '/'
}

const fromBuild = () => walk(outDir)
    .filter((file) => file.endsWith('.html'))
    .map((file) => toRoute(file, outDir, /\.html$/))
    .filter((route) => !/^\/(404|500|200|_)/.test(route))

const fromPages = () => walk(pagesDir)
    .filter((file) => !/[[_]/.test(relative(pagesDir, file)))
    .map((file) => toRoute(file, pagesDir, /\.\w+$/))

const siteUrl = readSiteUrl()
if (!siteUrl) {
    console.warn('sitemap: no *SITE_URL in .env.production, sitemap.xml skipped')
    process.exit(0)
}

const routes = [...new Set(pagesDir ? fromPages() : fromBuild())].sort()
const today = new Date().toISOString().slice(0, 10)
const urls = routes.map((route) => `  <url><loc>${siteUrl}${route}</loc><lastmod>${today}</lastmod></url>`)

writeFileSync(join(toDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)
writeFileSync(join(toDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)
console.log(`sitemap: ${routes.length} page(s) -> ${toDir}/sitemap.xml, robots.txt`)
