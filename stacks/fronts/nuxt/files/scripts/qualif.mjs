/*
 * Qualif (the site shown to the client before it goes online): npm run generate:qualif, or build:qualif with the API inside.
 * .env.preprod has the same lines as .env.production, only the addresses change:
 *   NUXT_PUBLIC_SITE_URL=https://qualifs.example.com/my-site   -> the site is served from the folder /my-site/
 * This script reads that folder in the address, then:
 *   1. runs Nuxt with .env.preprod and this folder as the base of the site (pages, links, scripts);
 *   2. moves into the folder what is written from the root in the code: the files of public/ ("/images/logo.png");
 *   3. static site: writes the qualif .htaccess (the production rules, pointing into the folder, never indexed) and robots.txt;
 *   4. puts the result in qualif/<folder>/ at the root of the project, ready to upload.
 * Dev and production never use it. start.bat then Q runs it and prepares the qualif/ folder to upload.
 *   node scripts/qualif.mjs generate     static site (nuxt generate)
 *   node scripts/qualif.mjs build        site with the API inside, one Node.js server (nuxt build)
 */
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { brotliCompressSync, gzipSync } from 'node:zlib'

const ROOT = process.cwd()

// Writes a file and its compressed copies made by Nuxt (.gz, .br), so they never keep the old text
function writeWithCopies(file, text) {
    writeFileSync(file, text)
    if (existsSync(`${file}.gz`)) writeFileSync(`${file}.gz`, gzipSync(text))
    if (existsSync(`${file}.br`)) writeFileSync(`${file}.br`, brotliCompressSync(text))
}
const OUTPUT = join(ROOT, '.output', 'public')
const TEXT_FILES = /\.(html|js|mjs|css|json|xml|webmanifest|txt)$/
const command = process.argv[2] === 'build' ? 'build' : 'generate'

// The folder of the site, from NUXT_PUBLIC_SITE_URL of .env.preprod: "https://qualifs.example.com/my-site" -> "/my-site/"
const envFile = join(ROOT, '.env.preprod')
if (!existsSync(envFile)) throw new Error('qualif: .env.preprod not found (a copy of .env.production with the qualif addresses).')
const env = Object.fromEntries(readFileSync(envFile, 'utf8').split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)).filter(Boolean)
    .map(([, key, value]) => [key, value.replace(/^(['"])(.*)\1$/, '$2')]))
if (!env.NUXT_PUBLIC_SITE_URL) throw new Error('qualif: NUXT_PUBLIC_SITE_URL is missing in .env.preprod.')
const folder = new URL(env.NUXT_PUBLIC_SITE_URL).pathname.replace(/^\/+|\/+$/g, '')
const base = folder ? `/${folder}/` : '/'

// 1. Nuxt, with the folder as the base of the site
const nuxt = spawnSync(`npx nuxt ${command} --dotenv .env.preprod`, {
    stdio: 'inherit', shell: true, env: { ...process.env, NUXT_APP_BASE_URL: base },
})
if (nuxt.status !== 0) process.exit(nuxt.status ?? 1)
if (base === '/') {
    console.log('qualif: the site is at the root of its address, nothing else to do.')
    process.exit(0)
}

// 2. Files of public/ written from the root in the code ("/images/...", "/favicon.ico"...): in the pages (between quotes)
//    and in the minified scripts (between backticks). With the API inside, server/plugins/qualif.ts does it for the pages.
const publicEntries = readdirSync(join(ROOT, 'public')).filter((name) => !name.startsWith('.'))
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const pattern = new RegExp(`(["'\`(=,\\s])/(${publicEntries.map(escape).join('|')})(?=[/"'\`?#)\\s,]|$)`, 'g')
const walk = (dir) => readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
})
let changedPaths = 0
for (const file of walk(OUTPUT).filter((path) => TEXT_FILES.test(path))) {
    const text = readFileSync(file, 'utf8')
    const moved = text.replace(pattern, (match, before, entry) => {
        changedPaths++
        return `${before}${base}${entry}`
    })
    if (moved !== text) writeWithCopies(file, moved)
}

// 3. Static site: the qualif .htaccess (the production one, its root addresses moved into the folder, never indexed)
const htaccessFile = join(OUTPUT, '.htaccess')
if (command === 'generate' && existsSync(htaccessFile)) {
    const rules = readFileSync(htaccessFile, 'utf8')
        .replace(/https:\/\/%\{HTTP_HOST\}\/\$1/g, `https://%{HTTP_HOST}${base}$1`)
        .replace(/(ErrorDocument\s+\d+\s+)\/(?!\/)/g, `$1${base}`)
        .replace(/(RewriteRule\s+\S+\s+)\/(\d{3}\.html|index\.html)/g, `$1${base}$2`)
    writeWithCopies(htaccessFile, `# Qualif: the .htaccess of production, its addresses moved into ${base} (scripts/qualif.mjs)\n`
        + '<IfModule mod_headers.c>\n    Header always set X-Robots-Tag "noindex, nofollow"\n</IfModule>\n\n' + rules)
}
if (command === 'generate') writeWithCopies(join(OUTPUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n')

// sitemap.xml: the prerender gives the pages with their folder and @nuxtjs/sitemap adds it again ("/my-site/my-site/"):
// each address back to a single folder, each page once
const sitemapFile = join(OUTPUT, 'sitemap.xml')
if (base !== '/' && existsSync(sitemapFile)) {
    const twice = new RegExp(`(${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?:${base.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})+`, 'g')
    const seen = new Set()
    const sitemap = readFileSync(sitemapFile, 'utf8').replace(twice, '$1')
        .replace(/\s*<url>[\s\S]*?<\/url>/g, (entry) => {
            const loc = entry.match(/<loc>([^<]*)<\/loc>/)?.[1]
            if (seen.has(loc)) return ''
            seen.add(loc)
            return entry
        })
    writeWithCopies(sitemapFile, sitemap)
}

// 4. Into qualif/<folder>/: the static site, or the Node.js server (its build, package.json, .env.preprod as .env.production)
const target = join(ROOT, '..', 'qualif', folder)
rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
if (command === 'generate') {
    cpSync(OUTPUT, target, { recursive: true })
} else {
    cpSync(join(ROOT, '.output'), join(target, '.output'), { recursive: true })
    cpSync(join(ROOT, 'package.json'), join(target, 'package.json'))
    writeFileSync(join(target, '.env.production'), readFileSync(envFile))
}

console.log(`qualif: ${changedPaths} addresses moved into ${base}. Ready to upload: qualif/${folder}/`)
