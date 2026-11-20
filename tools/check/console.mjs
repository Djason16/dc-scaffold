// Browser console of a page, read with Chrome headless through the DevTools protocol (no npm package: the WebSocket of Node)
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Starts Chrome headless; returns { browser, close } */
export async function launchChrome(chromePath, port) {
    const profile = mkdtempSync(join(tmpdir(), 'dcs-chrome-'))
    const child = spawn(chromePath, [
        '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
        '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-gpu', 'about:blank',
    ], { stdio: 'ignore' })
    let version = null
    for (let i = 0; i < 60 && !version; i++) {
        try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json() } catch { await sleep(500) }
    }
    if (!version) { child.kill(); throw new Error('Chrome did not start') }
    const browser = await connect(version.webSocketDebuggerUrl)
    const close = async () => {
        try { await browser.send('Browser.close') } catch { /* already closed */ }
        child.kill()
        await sleep(500)
        try { rmSync(profile, { recursive: true, force: true }) } catch { /* Chrome still holds a file */ }
    }
    return { browser, close }
}

// A DevTools connection: send(method, params, sessionId) and on(handler) for the events
async function connect(url) {
    const socket = new WebSocket(url)
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
    let next = 0
    const pending = new Map()
    const handlers = new Set()
    socket.onmessage = ({ data }) => {
        const message = JSON.parse(data)
        if (message.id && pending.has(message.id)) {
            const { resolve, reject } = pending.get(message.id)
            pending.delete(message.id)
            if (message.error) reject(new Error(message.error.message))
            else resolve(message.result)
        } else for (const handler of handlers) handler(message)
    }
    return {
        send: (method, params = {}, sessionId) => new Promise((resolve, reject) => {
            const id = ++next
            pending.set(id, { resolve, reject })
            socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
        }),
        on: (handler) => { handlers.add(handler); return () => handlers.delete(handler) },
    }
}

const text = (args = []) => args.map((arg) => arg.value ?? arg.description ?? arg.type).join(' ')

/**
 * Opens a URL in a new tab and returns the console warnings and errors (and uncaught exceptions) seen until the page
 * has been quiet for a while. allowStatus: an HTTP status expected for the page itself (404 for the "not found" page).
 */
export async function consoleOf(browser, url, { allowStatus = null, settleMs = 4000 } = {}) {
    const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' })
    const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true })
    const found = []
    // The page itself, also after a redirection to its address with a final slash (static exports)
    const samePage = (address = '') => address.replace(/\/$/, '') === url.replace(/\/$/, '')
    let loaded = false
    let documentStatus = null
    const off = browser.on((message) => {
        if (message.sessionId !== sessionId) return
        const { method, params } = message
        if (method === 'Runtime.consoleAPICalled' && ['warning', 'error', 'assert'].includes(params.type)) {
            found.push(`console.${params.type}: ${text(params.args)}`)
        } else if (method === 'Runtime.exceptionThrown') {
            const details = params.exceptionDetails
            found.push(`exception: ${details.exception?.description ?? details.text}`)
        } else if (method === 'Log.entryAdded' && ['warning', 'error'].includes(params.entry.level)) {
            // The expected status of the page itself (the 404 page) is not a problem
            if (allowStatus && samePage(params.entry.url) && params.entry.text.includes(String(allowStatus))) return
            found.push(`${params.entry.source} ${params.entry.level}: ${params.entry.text}${params.entry.url ? ` (${params.entry.url})` : ''}`)
        } else if (method === 'Network.responseReceived' && params.type === 'Document' && samePage(params.response.url)) {
            documentStatus = params.response.status
        } else if (method === 'Page.loadEventFired') {
            loaded = true
        }
    })
    try {
        for (const domain of ['Runtime', 'Log', 'Network', 'Page']) await browser.send(`${domain}.enable`, {}, sessionId)
        await browser.send('Page.navigate', { url }, sessionId)
        for (let i = 0; i < 120 && !loaded; i++) await sleep(250)
        if (!loaded) found.push('page: the load event never came (30 s)')
        await sleep(settleMs)
        const expected = allowStatus ?? 200
        if (documentStatus !== null && documentStatus !== expected && !(allowStatus === 404 && documentStatus === 200)) {
            found.push(`page: HTTP ${documentStatus} (expected ${expected})`)
        }
    } finally {
        off()
        await browser.send('Target.closeTarget', { targetId }).catch(() => {})
    }
    return [...new Set(found)]
}
