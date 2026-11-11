/*
 * Start file of the Node.js server, for the hosts that load a file instead of running npm start
 * (cPanel "Setup Node.js App", o2switch: Application startup file = server.cjs).
 * It runs the "start" command of package.json in this process:
 *   1. reads the settings given by --env-file (else .env.production when it is there);
 *   2. loads the modules given by --import (the start module of the qualif);
 *   3. gives back to the site the folder of its address when the host removes it (qualif in /my-site/);
 *   4. starts the file of the command ("node .output/server/index.mjs", "next start"...).
 * What happens is written in .startup.log, next to this file (hidden: the host does not serve it). Elsewhere (Infomaniak, a VPS), npm start is enough.
 * CommonJS on purpose: the host loads this file with require().
 */
const { appendFileSync, existsSync, readFileSync, statSync } = require('node:fs')
const http = require('node:http')
const { isAbsolute, join } = require('node:path')
const { pathToFileURL } = require('node:url')

const log = (text) => {
    try { appendFileSync(join(__dirname, '.startup.log'), `${new Date().toISOString()} ${text}\n`) } catch { /* read-only folder */ }
}
process.on('uncaughtException', (error) => log(`uncaught: ${error.stack ?? error}`))

// The words of a command, quotes kept together: node --import ./a.mjs "my file.js" -> ['node', '--import', './a.mjs', 'my file.js']
const words = (command) => [...command.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map(([, a, b, c]) => a ?? b ?? c)

// The file of a command ("next"): the "bin" of its package in node_modules
const binFile = (name) => {
    try {
        const pkg = JSON.parse(readFileSync(join(__dirname, 'node_modules', name, 'package.json'), 'utf8'))
        const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.[name]
        if (bin) return join('node_modules', name, bin)
    } catch { /* not a package of that name */ }
    return join('node_modules', '.bin', name)
}

const run = async () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'))
    const start = (pkg.scripts?.start ?? '').trim()
    if (!start) throw new Error('no "start" command in package.json')
    let [first, ...rest] = words(start)
    if (first !== 'node') rest = [binFile(first), ...rest]

    // Flags of node before the file: settings and modules to load first, the others are left out
    const envFiles = []
    const imports = []
    while (rest.length && rest[0].startsWith('-')) {
        const flag = rest.shift()
        if (flag.startsWith('--env-file=')) envFiles.push(flag.slice('--env-file='.length))
        else if (flag === '--env-file') envFiles.push(rest.shift())
        else if (flag.startsWith('--import=')) imports.push(flag.slice('--import='.length))
        else if (flag === '--import') imports.push(rest.shift())
    }
    let [file, ...args] = rest
    if (!file) throw new Error(`no file to start in "${start}"`)
    // A folder ("node build" of SvelteKit): its index.js, as node does
    if (existsSync(join(__dirname, file)) && statSync(join(__dirname, file)).isDirectory()) file = join(file, 'index.js')

    if (!envFiles.length && existsSync(join(__dirname, '.env.production'))) envFiles.push('.env.production')
    for (const envFile of envFiles) process.loadEnvFile(join(__dirname, envFile))
    process.chdir(__dirname)
    log(`start: ${start} (node ${process.version}, settings ${envFiles.join(', ') || 'none'})`)

    const toUrl = (path) => pathToFileURL(isAbsolute(path) ? path : join(__dirname, path)).href
    for (const module of imports) await import(toUrl(module))

    // The host may give the address without the folder of the site ("/products" for "/my-site/products"):
    // the folder is put back. Set after the modules above, so it runs before them (the start module of a
    // separate API then removes it again, as it expects)
    const folder = (process.env.PASSENGER_BASE_URI || '').replace(/\/$/, '')
    if (folder) {
        const emit = http.Server.prototype.emit
        http.Server.prototype.emit = function (event, request, ...more) {
            if (event === 'request' && request.url && request.url !== folder && !request.url.startsWith(`${folder}/`) && !request.url.startsWith(`${folder}?`)) {
                request.url = folder + (request.url.startsWith('/') ? request.url : `/${request.url}`)
            }
            return emit.call(this, event, request, ...more)
        }
    }

    process.argv = [process.argv[0], join(__dirname, file), ...args]
    // A file without extension (the "bin" of a package) is CommonJS: require() reads it, import() does not
    if (/\.[cm]?js$/.test(file)) await import(toUrl(file))
    else require(join(__dirname, file))
}

run().catch((error) => {
    log(`not started: ${error.stack ?? error}`)
    process.exitCode = 1
})
