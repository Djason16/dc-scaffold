// Process helpers of the quality check (tools/check/check.mjs): commands, servers, HTTP waits, log scanning
import { spawn, spawnSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const onWindows = process.platform === 'win32'
// Windows needs a shell for npm.cmd / npx.cmd: one command line, arguments with spaces quoted
const line = (command, args) => [command, ...args.map((arg) => (/[\s&|<>^]/.test(arg) ? `"${arg}"` : arg))].join(' ')

// Lines that report a problem in the output of a tool (lint, tsc, build, dev server)
const PROBLEM = /\b(warn(ing)?s?|errors?|deprecat\w*|fail(ed|ure)?)\b|\u26a0|\u2716/i
// ...except the lines that say there is none, and the noise of npm itself
const NOT_A_PROBLEM = [
    /\b0 (errors?|warnings?|problems?)\b/i,
    /\bfound 0\b/i,
    /\bno (errors?|warnings?|problems?|issues?)\b/i,
    /errors? and 0 warnings?/i,
    /^\s*>\s/, // "> frontend@0.0.0 lint": the npm script header
    /^\s*\$ /, // command lines written by run()
    /scripts\/(design|sitemap)\.mjs/, // file names of the project containing these words
    /found 0 vulnerabilities/i,
    /^No syntax errors detected/, // php -l
    /\d+(\.\d+)? kB\b/, // file sizes of a build (server-errors.js  24.36 kB)
]

// Warnings printed by the frameworks themselves, whatever the project: not caused by the models of DC Scaffold.
// Reported apart ("upstream"); remove a line here when a new version of the framework fixes it.
const UPSTREAM = [
    /@__NO_SIDE_EFFECTS__|contains an annotation that Rollup cannot interpret|\.nuxt\/dist\/server\/server\.mjs \(\d+:\d+\): A comment$/, // Nuxt 4.6 + Rolldown
    /nitro-server\/dist\/runtime\/utils\/cache-driver\.mjs" is imported by/, // Nuxt 4.6 generate
    /Unknown cli config "--pretty"/, // "qwik build" runs "npm run lint --pretty"
    /\[PLUGIN_TIMINGS\]/, // Rolldown (Nuxt, Vite) when its plugins are slow, the computer being busy
    /Slow filesystem detected/, // Next.js when the computer is busy (several projects checked at once)
]

/** Whether a problem line comes from the framework itself (see UPSTREAM) */
export const isUpstream = (line) => UPSTREAM.some((known) => known.test(line))

/** Lines of a tool output that report a warning or an error */
export function problems(text) {
    let file = ''
    return text.split(/\r?\n/)
        .map((line) => line.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '').trimEnd())
        // The file of the next lines in the output of ESLint ("C:\...\Header.vue" then "  3:10  warning ...")
        .map((line) => {
            if (/^(?:[A-Za-z]:\\|\/)\S.*\.\w+$/.test(line)) file = line.split(/[\\/]/).slice(-3).join('/')
            return file && /^\s+\d+:\d+\s/.test(line) ? `${file} ${line.trim()}` : line
        })
        .filter((line) => PROBLEM.test(line) && !NOT_A_PROBLEM.some((ok) => ok.test(line)))
}

/** Runs a command (several at once: asynchronous), appends its output to the log, resolves to { ok, output } */
export function run(command, args, cwd, log, { timeout = 900_000, env = {} } = {}) {
    const server = start(command, args, cwd, log, env)
    const timer = setTimeout(() => { server.output += `\n!! timeout after ${timeout / 1000} s`; stop(server) }, timeout)
    return new Promise((resolve) => {
        server.child.on('error', (error) => { server.output += `\n!! ${error.message}` })
        server.child.on('close', (code) => { clearTimeout(timer); resolve({ ok: code === 0, output: server.output }) })
    })
}

// Environment of the commands: without NO_COLOR, which some tools set FORCE_COLOR against (Node.js then warns)
const { NO_COLOR: _noColor, ...childEnv } = process.env

/** Starts a long-running command (dev server); its output is kept in server.output and the log */
export function start(command, args, cwd, log, env = {}) {
    appendFileSync(log, `\n$ ${command} ${args.join(' ')}   (in ${cwd})\n`)
    const child = spawn(onWindows ? line(command, args) : command, onWindows ? [] : args, {
        cwd, shell: onWindows, detached: !onWindows, stdio: ['ignore', 'pipe', 'pipe'], env: { ...childEnv, BROWSER: 'none', ...env },
    })
    const server = { child, output: '' }
    const keep = (chunk) => { server.output += chunk; appendFileSync(log, chunk) }
    child.stdout.on('data', keep)
    child.stderr.on('data', keep)
    return server
}

/** Stops a process and all its children */
export function stop(server) {
    if (server?.close) return server.close()
    if (!server || server.child.exitCode !== null) return
    if (onWindows) spawnSync('taskkill', ['/pid', String(server.child.pid), '/T', '/F'], { stdio: 'ignore' })
    else try { process.kill(-server.child.pid, 'SIGKILL') } catch { /* already gone */ }
}

/** HTTP status of a URL once something answers (0 = nothing answered in time) */
export async function waitHttp(url, seconds = 120) {
    for (let i = 0; i < seconds; i++) {
        try {
            const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20_000) })
            // 503: the dev server is still compiling (Nuxt)
            if (response.status !== 503 || i === seconds - 1) return response.status
            await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
    }
    return 0
}

/** Scripts of the package.json of a folder ({} when there is none) */
export function scripts(dir) {
    const file = join(dir, 'package.json')
    return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).scripts ?? {} : {}
}

/** Chrome or Chromium of this computer (CHROME_PATH first) */
export function findChrome() {
    const candidates = [
        process.env.CHROME_PATH,
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    ]
    return candidates.find((path) => path && existsSync(path)) ?? null
}

/**
 * Serves the HTML / CSS / JS front like its nginx container and .htaccess: "/" -> pages/index.html,
 * "/about" -> pages/about.html, any other unknown page -> pages/404.html with a 404 status
 */
export async function serveStatic(root, port) {
    const { createServer } = await import('node:http')
    const { extname, normalize } = await import('node:path')
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
        '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webp': 'image/webp' }
    const server = createServer((request, response) => {
        const path = normalize(decodeURIComponent(new URL(request.url, 'http://x').pathname)).replace(/^[\\/]+|[\\/]+$/g, '')
        let file = join(root, path)
        let status = 200
        if (!path) file = join(root, 'pages', 'index.html')
        else if (!existsSync(file) || !extname(file)) {
            file = join(root, 'pages', `${path}.html`)
            if (!existsSync(file)) { file = join(root, 'pages', '404.html'); status = 404 }
        }
        response.writeHead(status, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
        response.end(readFileSync(file))
    })
    await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve))
    return { child: { exitCode: null }, output: '', close: () => server.close() }
}

/** The first free TCP port from this one (a port taken by another program makes some servers pick a random one) */
export async function freePort(port) {
    const { createServer } = await import('node:net')
    const free = (candidate) => new Promise((resolve) => {
        const probe = createServer().once('error', () => resolve(false)).once('listening', () => probe.close(() => resolve(true)))
        probe.listen(candidate, '0.0.0.0')
    })
    while (!(await free(port))) port += 100
    return port
}

/** Whether a command exists on this computer */
export function hasCommand(command) {
    return spawnSync(onWindows ? 'where' : 'which', [command], { stdio: 'ignore' }).status === 0
}
