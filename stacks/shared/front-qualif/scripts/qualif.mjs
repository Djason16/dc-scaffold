/*
 * Qualif (the site shown to the client before it goes online): npm run build:qualif, or start.bat then Q.
 * .env.preprod has the same lines as .env.production, only the addresses change:
 *   *_SITE_URL=https://qualifs.example.com/my-site   -> the site is served from the folder /my-site/
 * This script reads that folder in the address, then:
 *   1. runs the production build of the site with the settings of .env.preprod and this folder as its base;
 *   2. moves into the folder what is still written from the root: the files of public/ ("/images/logo.png") and the
 *      links of the pages ("/contact/");
 *   3. writes the qualif .htaccess (the production rules, pointing into the folder, never indexed) and robots.txt;
 *   4. puts the result in qualif/<folder>/ at the root of the project, ready to upload.
 * The settings of this front are in scripts/qualif.json. Dev and production never use this script.
 */
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { brotliCompressSync, gzipSync } from 'node:zlib'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const settings = JSON.parse(readFileSync(join(ROOT, 'scripts', 'qualif.json'), 'utf8'))
const TEXT_FILES = /\.(html|js|mjs|css|json|xml|webmanifest|txt|svg)$/
// Never copied into a qualif: the modules, the settings of dev and production, the local data
const SKIP = new Set(['node_modules', '.env', '.env.production', '.env.preprod', '.env.example', '.git', 'database', 'data', 'qualif'])

// 1. The folder of the site, from the address of .env.preprod: "https://qualifs.example.com/my-site" -> "/my-site/"
const envFile = join(ROOT, '.env.preprod')
if (!existsSync(envFile)) throw new Error('qualif: .env.preprod not found (a copy of .env.production with the qualif addresses).')
const env = Object.fromEntries(readFileSync(envFile, 'utf8').split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)).filter(Boolean)
    .map(([, key, value]) => [key, value.replace(/^(['"])(.*)\1$/, '$2')]))
const siteUrl = env[settings.siteUrl]
if (!siteUrl) throw new Error(`qualif: ${settings.siteUrl} is missing in .env.preprod.`)
const folder = new URL(siteUrl).pathname.replace(/^\/+|\/+$/g, '')
const base = folder ? `/${folder}/` : '/'
const target = join(ROOT, '..', 'qualif', folder || 'site')

// 2. The production build, with the settings of .env.preprod and the folder as the base of the site
if (settings.build) {
    const build = spawnSync(settings.build.replaceAll('{base}', base), {
        cwd: ROOT, stdio: 'inherit', shell: true,
        env: { ...process.env, ...env, QUALIF_ENV_FILE: '.env.preprod', QUALIF_BASE_URL: base, QUALIF_BASE_PATH: base.replace(/\/$/, '') },
    })
    if (build.status !== 0) process.exit(build.status ?? 1)
}
// Some builds put the site in a folder named like the base (Qwik: dist/my-site/): back to the root of the output
const nested = join(ROOT, settings.output || '.', folder)
if (folder && settings.output && existsSync(nested) && statSync(nested).isDirectory()) {
    for (const name of readdirSync(nested)) {
        rmSync(join(ROOT, settings.output, name), { recursive: true, force: true })
        renameSync(join(nested, name), join(ROOT, settings.output, name))
    }
    rmSync(nested, { recursive: true, force: true })
}
// What the build does on the finished output (sitemap.xml), done again on the site back at its root
if (settings.after) {
    const after = spawnSync(settings.after, { cwd: ROOT, stdio: 'inherit', shell: true, env: { ...process.env, ...env, QUALIF_ENV_FILE: '.env.preprod' } })
    if (after.status !== 0) process.exit(after.status ?? 1)
}

// 3. Into qualif/<folder>/: the built site, or the whole site for a Node.js server (with .env.preprod as .env.production)
rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
const source = join(ROOT, settings.output || '.')
const copyFrom = settings.server ? ROOT : source
for (const name of readdirSync(copyFrom)) {
    if (SKIP.has(name) || (copyFrom === ROOT && !settings.server && name === 'scripts')) continue
    cpSync(join(copyFrom, name), join(target, name), { recursive: true })
}
// The folder too, for the servers that read their settings again when they start (next start)
if (settings.server) {
    writeFileSync(join(target, '.env.production'), `${readFileSync(envFile, 'utf8').trimEnd()}\n\n# Qualif: the folder of the site (scripts/qualif.mjs)\nQUALIF_BASE_URL=${base}\nQUALIF_BASE_PATH=${base.replace(/\/$/, '')}\n`)
}

// Site without build: its sitemap.xml written straight into the qualif (its own files stay as they are)
if (settings.sitemap) {
    const sitemap = spawnSync(settings.sitemap.replaceAll('{target}', `"${target}"`), { cwd: ROOT, stdio: 'inherit', shell: true, env: { ...process.env, QUALIF_ENV_FILE: '.env.preprod' } })
    if (sitemap.status !== 0) process.exit(sitemap.status ?? 1)
}

const walk = (dir) => readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (name === 'node_modules') return []
    return statSync(path).isDirectory() ? walk(path) : [path]
})
// Writes a file and its compressed copies (.gz, .br), so they never keep the old text
const writeWithCopies = (file, text) => {
    writeFileSync(file, text)
    if (existsSync(`${file}.gz`)) writeFileSync(`${file}.gz`, gzipSync(text))
    if (existsSync(`${file}.br`)) writeFileSync(`${file}.br`, brotliCompressSync(text))
}

let changedPaths = 0
if (base !== '/') {
    // Files served as they are (public/, or the folders of the site itself): "/images/..." -> "/my-site/images/..."
    const publicDir = join(ROOT, settings.public || '.')
    const entries = existsSync(publicDir) ? readdirSync(publicDir).filter((name) => !name.startsWith('.') && !SKIP.has(name)) : []
    const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const publicPattern = entries.length
        ? new RegExp(`(["'\`(=,\\s])/(${entries.map(escape).join('|')})(?=[/"'\`?#)\\s,]|$)`, 'g') : null
    // Links and sources of the pages written from the root ("/contact/"), outside the folder
    const attribute = /(\s(?:href|src|action|poster|data-src)=["'])(\/(?!\/)[^"']*)/g
    // A Node.js server builds its pages itself: only its prerendered pages, when it has some (settings.client)
    const clientDir = settings.server ? (settings.client ? join(target, settings.client) : null) : target
    for (const file of clientDir && existsSync(clientDir) ? walk(clientDir).filter((path) => TEXT_FILES.test(path)) : []) {
        const text = readFileSync(file, 'utf8')
        let moved = publicPattern ? text.replace(publicPattern, (match, before, entry) => { changedPaths++; return `${before}${base}${entry}` }) : text
        if (/\.html$/.test(file)) {
            moved = moved.replace(attribute, (match, before, path) => {
                if (path.startsWith(base)) return match
                changedPaths++
                return `${before}${base.replace(/\/$/, '')}${path}`
            })
        }
        if (moved !== text) writeWithCopies(file, moved)
    }

    // The qualif .htaccess: the production one, its root addresses moved into the folder, never indexed
    const htaccessFile = join(target, '.htaccess')
    if (existsSync(htaccessFile)) {
        const rules = readFileSync(htaccessFile, 'utf8')
            .replace(/https:\/\/%\{HTTP_HOST\}\/\$1/g, `https://%{HTTP_HOST}${base}$1`)
            .replace(/(ErrorDocument\s+\d+\s+)\/(?!\/)/g, `$1${base}`)
            .replace(/(RewriteRule\s+\S+\s+)\/(?!\/)([\w./-]*\.html)/g, `$1${base}$2`)
        writeWithCopies(htaccessFile, `# Qualif: the .htaccess of production, its addresses moved into ${base} (scripts/qualif.mjs)\n`
            + '<IfModule mod_headers.c>\n    Header always set X-Robots-Tag "noindex, nofollow"\n</IfModule>\n\n' + rules)
    }
}
// Node.js server: a start module of the qualif moves into the folder the links of the pages it sends ("/contact/")
if (settings.server && base !== '/') {
    const prefix = base.replace(/\/$/, '')
    writeFileSync(join(target, 'qualif-html.mjs'), `// Qualif: the site is served from ${base}: the links of its pages written from the root move into it (scripts/qualif.mjs)
import http from 'node:http'
const PREFIX = '${prefix}'
const attribute = /(\\s(?:href|src|action|poster|data-src)=["'])(\\/(?!\\/)[^"']*)/g
const move = (html) => html.replace(attribute, (match, before, path) => path === PREFIX || path.startsWith(PREFIX + '/') ? match : before + PREFIX + path)
const wrap = (response) => {
    const { writeHead, write, end } = response
    let chunks
    // Only the pages (HTML, not compressed): they are kept until the end, then sent with their links moved
    const decide = () => {
        if (chunks !== undefined) return
        const isPage = /text\\/html/.test(String(response.getHeader('content-type') ?? '')) && !response.getHeader('content-encoding')
        chunks = isPage ? [] : null
        if (isPage) response.removeHeader('content-length')
    }
    response.writeHead = function (status, message, headers) {
        if (typeof message !== 'string') [headers, message] = [message, undefined]
        if (headers && !Array.isArray(headers)) {
            for (const [name, value] of Object.entries(headers)) if (value !== undefined) response.setHeader(name, value)
            headers = undefined
        }
        decide()
        return message ? writeHead.call(this, status, message, headers) : writeHead.call(this, status, headers)
    }
    response.write = function (chunk, encoding, callback) {
        decide()
        if (!chunks) return write.call(this, chunk, encoding, callback)
        chunks.push(Buffer.from(chunk, typeof encoding === 'string' ? encoding : undefined))
        if (typeof (callback ?? encoding) === 'function') (callback ?? encoding)()
        return true
    }
    response.end = function (chunk, encoding, callback) {
        decide()
        if (!chunks) return end.call(this, chunk, encoding, callback)
        if (typeof chunk === 'function') [chunk, callback] = [undefined, chunk]
        if (typeof encoding === 'function') [encoding, callback] = [undefined, encoding]
        if (chunk) chunks.push(Buffer.from(chunk, typeof encoding === 'string' ? encoding : undefined))
        return end.call(this, move(Buffer.concat(chunks).toString('utf8')), callback)
    }
}
const emit = http.Server.prototype.emit
http.Server.prototype.emit = function (event, request, response, ...rest) {
    if (event === 'request') {
        // Pages sent without compression, so their links can be read
        delete request.headers['accept-encoding']
        // Never indexed
        response.setHeader('X-Robots-Tag', 'noindex, nofollow')
        wrap(response)
    }
    return emit.call(this, event, request, response, ...rest)
}
`)
    // npm start loads it first: "node server.js" -> "node --import ./qualif-html.mjs server.js", "next start" -> through node
    const packageFile = join(target, 'package.json')
    const pkg = JSON.parse(readFileSync(packageFile, 'utf8'))
    const start = pkg.scripts?.start ?? ''
    // The file of a command ("next"): its package in node_modules says where it is (the "bin" of its package.json)
    const binFile = (name) => {
        for (const owner of readdirSync(join(ROOT, 'node_modules'))) {
            const file = join(ROOT, 'node_modules', owner, 'package.json')
            const bin = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).bin : null
            const path = typeof bin === 'string' && owner === name ? bin : bin?.[name]
            if (path) return `node_modules/${owner}/${path.replace(/^\.\//, '')}`
        }
        return `node_modules/.bin/${name}`
    }
    pkg.scripts.start = start.startsWith('node ')
        ? start.replace(/^node /, 'node --import ./qualif-html.mjs ')
        : start.replace(/^(\S+)/, (name) => `node --import ./qualif-html.mjs ${binFile(name)}`)
    writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`)
}

// Nothing to index in a qualif
if (!settings.server) writeWithCopies(join(target, 'robots.txt'), 'User-agent: *\nDisallow: /\n')

// Site without build (HTML / CSS / JS): the address of the API of the qualif in js/config.js
if (settings.apiConfig && env.API_URL) {
    const configFile = join(target, settings.apiConfig)
    if (existsSync(configFile)) {
        const text = readFileSync(configFile, 'utf8')
        writeFileSync(configFile, text.replace(/(IS_DEV\s*\?\s*'[^']*'\s*:\s*)'[^']*'/, `$1'${env.API_URL}'`))
    }
}

console.log(`qualif: ${changedPaths} addresses moved into ${base}. Ready to upload: ${relative(join(ROOT, '..'), target).split(sep).join('/')}/`)
