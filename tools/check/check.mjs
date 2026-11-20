// Quality check of new projects: every front (TypeScript and JavaScript, one and two languages, design on and off) and
// every back end is created with the engine, then must pass lint, type check, build, start and a clean browser console
// with zero error and zero warning. See docs/12-developper-dc-scaffold.md.
//   node tools/check/check.mjs [--only react,none-express] [--jobs 3] [--dir <folder>] [--keep] [--no-console]
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consoleOf, launchChrome } from './console.mjs'
import { findChrome, freePort, hasCommand, isUpstream, problems, run, scripts, serveStatic, start, stop, waitHttp } from './run.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const STACKS = join(ROOT, 'stacks')
const option = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : fallback }
const flag = (name) => process.argv.includes(`--${name}`)
const WORK = resolve(option('dir', join(tmpdir(), 'dcs-check')))
const JOBS = Number(option('jobs', 3))
const ONLY = option('only', '').split(',').filter(Boolean)
const CHROME = flag('no-console') ? null : findChrome()
const STEPS = ['lint', 'types', 'build', 'start', 'console']

const readStack = (kind, id) => ({ id, ...JSON.parse(readFileSync(join(STACKS, kind, id, 'stack.json'), 'utf8')) })
const list = (kind) => readdirSync(join(STACKS, kind)).filter((id) => id !== 'none' && existsSync(join(STACKS, kind, id, 'stack.json')))
    .map((id) => readStack(kind, id))
const isPhp = (item) => item.back !== 'none' && readStack('backs', item.back).runtime === 'php'
const scriptsOf = (stack) => (stack.script ? [stack.script] : ['ts', 'js'])

/** Every case to create: name, engine options, and whether the design is also checked turned off */
function matrix() {
    const fronts = list('fronts')
    const backs = list('backs')
    const separate = backs.filter((back) => !back.onlyInside)
    const cases = []
    const covered = new Set()
    let turn = 0
    for (const front of fronts) {
        for (const script of scriptsOf(front)) {
            // Two languages, no API: the biggest front, checked with the design on, then off
            cases.push({ name: `${front.id}-${script}-2lang`, front: front.id, back: 'none', script, languages: 'fr,en', design: true })
            // One language, with an API: inside the site when the front has one, otherwise a separate back end in turn
            const inside = backs.find((back) => back.inside?.[front.id])
            const back = inside ?? separate[turn++ % separate.length]
            cases.push({ name: `${front.id}-${script}-1lang-${back.id}`, front: front.id, back: back.id, script, languages: 'fr' })
            // PHP back ends have no language; the API inside a site does not count for the back end alone (Nitro)
            if (!inside) covered.add(back.runtime === 'php' ? back.id : `${back.id}-${scriptsOf(back).includes(script) ? script : scriptsOf(back)[0]}`)
        }
    }
    // Every back end not checked yet with a front, alone, in each of its languages; PHP back ends also with PDO
    for (const back of separate) {
        for (const script of back.runtime === 'php' ? ['ts'] : scriptsOf(back)) {
            if (covered.has(back.runtime === 'php' ? back.id : `${back.id}-${script}`)) continue
            cases.push({ name: `none-${back.id}${back.runtime === 'php' ? '' : `-${script}`}`, front: 'none', back: back.id, script, languages: 'en' })
        }
        if (back.drivers?.includes('pdo')) {
            cases.push({ name: `none-${back.id}-pdo`, front: 'none', back: back.id, script: 'ts', languages: 'en', driver: 'pdo' })
        }
    }
    cases.forEach((item, i) => { item.appPort = 5300 + i; item.apiPort = 8300 + i })
    return cases.filter((item) => !ONLY.length || ONLY.some((only) => item.name.startsWith(only)))
}

/** Creates the project with the engine (output in the log) */
async function create(item, log) {
    const back = readStack('backs', item.back === 'none' ? 'none' : item.back)
    const database = back.database === true ? 'mysql' : back.database === 'optional' ? 'sqlite' : 'none'
    const args = ['-NoProfile', '-File', join(ROOT, 'engine', 'dc-scaffold.ps1'), '-Lang', item.languages === 'fr' ? 'fr' : 'en',
        '-Name', item.name, '-Destination', WORK, '-Front', item.front, '-Back', item.back, '-Languages', item.languages,
        '-Script', item.script, '-Database', database, '-AppPort', item.appPort, '-ApiPort', item.apiPort,
        '-SkipToolCheck', '-NoGit', '-NoEditor', '-Force', ...(item.driver ? ['-Driver', item.driver] : [])]
    return (await run('pwsh', args.map(String), ROOT, log, { timeout: 1_800_000 })).ok
}

// Step results: "ok", "warn" (it works but prints warnings), "fail", "-" (nothing to check)
const worst = (a, b) => ['-', 'ok', 'warn', 'fail'][Math.max(['-', 'ok', 'warn', 'fail'].indexOf(a), ['-', 'ok', 'warn', 'fail'].indexOf(b))]
function record(result, step, status, found = [], where = '') {
    const own = found.filter((line) => !isUpstream(line))
    // Only warnings of the framework itself: the step is ok for DC Scaffold, they are listed apart
    result.steps[step] = worst(result.steps[step] ?? '-', status === 'warn' && !own.length ? 'ok' : status)
    for (const line of found) (own.includes(line) ? result.problems : result.upstream).push(`[${step}${where ? ` ${where}` : ''}] ${line}`)
}
const judge = ({ ok, output }) => ({ status: !ok ? 'fail' : problems(output).length ? 'warn' : 'ok', found: problems(output) })

/** Lint, type check and build of a Node.js folder (frontend/ or backend/) */
async function checkNode(dir, item, result, log, where) {
    const own = scripts(dir)
    const npm = (script) => run('npm', ['run', script], dir, log)
    // Every Node.js project of DC Scaffold has its linter (ESLint, oxlint)
    if (own.lint) { const r = judge(await npm('lint')); record(result, 'lint', r.status, r.found, where) }
    else record(result, 'lint', 'fail', ['no "lint" script in package.json'], where)
    const typeScript = ['typecheck', 'type-check', 'check'].find((name) => own[name]) ?? null
    if (typeScript) { const r = judge(await npm(typeScript)); record(result, 'types', r.status, r.found, where) }
    // The build put online (start.bat): with its production settings when it has its own script (Nuxt: build:prod),
    // a static site for Nuxt alone (generate)
    const kind = item.front === 'nuxt' && where.startsWith('front') && item.back === 'none' ? 'generate' : 'build'
    const build = [`${kind}:prod`, kind, 'build'].find((name) => own[name])
    if (build) { const r = judge(await npm(build)); record(result, 'build', r.status, r.found, where) }
    // No type check script: the one of the editor, after the build (Nitro writes the types its tsconfig.json extends)
    if (!typeScript && existsSync(join(dir, 'tsconfig.json')) && existsSync(join(dir, 'node_modules', 'typescript'))) {
        const config = existsSync(join(dir, 'tsconfig.app.json')) ? 'tsconfig.app.json' : 'tsconfig.json'
        const r = judge(await run('npx', ['tsc', '--noEmit', '-p', config], dir, log))
        record(result, 'types', r.status, r.found, where)
    }
}
/** PHP back end: syntax of every file of the project, then the console of the framework */
async function checkPhp(dir, item, result, log) {
    const files = []
    const walk = (folder) => {
        for (const entry of readdirSync(folder, { withFileTypes: true })) {
            if (['vendor', 'node_modules', 'var', 'storage'].includes(entry.name)) continue
            const path = join(folder, entry.name)
            if (entry.isDirectory()) walk(path)
            else if (entry.name.endsWith('.php')) files.push(path)
        }
    }
    walk(dir)
    const bad = []
    for (const file of files) { const r = await run('php', ['-l', file], dir, log); if (!r.ok || problems(r.output).length) bad.push(r) }
    record(result, 'lint', bad.length ? 'fail' : 'ok', bad.flatMap((r) => problems(r.output)), 'api')
    const console = item.back === 'laravel' ? ['artisan', 'about'] : item.back === 'symfony' ? ['bin/console', 'lint:container'] : null
    if (console) { const r = judge(await run('php', console, dir, log)); record(result, 'build', r.status, r.found, 'api') }
}

/** Starts the API and the site, then reads the browser console of the home page and of an unknown page */
async function startAndLook(item, project, result, log, chromePort, label) {
    const servers = []
    const front = join(project, 'frontend')
    const back = join(project, 'backend')
    try {
        if (isPhp(item)) servers.push(start('php', ['-S', `127.0.0.1:${item.apiPort}`, '-t', 'public'], back, log))
        else if (scripts(back).dev) servers.push(start('npm', ['run', 'dev'], back, log))
        if (servers.length) {
            const status = await waitHttp(`http://127.0.0.1:${item.apiPort}/`)
            record(result, 'start', status > 0 && status < 500 ? 'ok' : 'fail', status ? [] : ['the API never answered'], `api${label}`)
        }
        let site = null
        if (scripts(front).dev) servers.push(start('npm', ['run', 'dev'], front, log))
        else if (item.front === 'vanilla') servers.push(await serveStatic(front, item.appPort))
        if (item.front !== 'none') {
            site = `http://localhost:${item.appPort}`
            const status = await waitHttp(`${site}/`, 180)
            record(result, 'start', status === 200 ? 'ok' : 'fail', status === 200 ? [] : [`GET / -> ${status}`], `front${label}`)
        }
        if (site && CHROME) {
            const chrome = await launchChrome(CHROME, chromePort)
            try {
                const found = [...await consoleOf(chrome.browser, `${site}/`),
                    ...await consoleOf(chrome.browser, `${site}/dcs-check-unknown-page`, { allowStatus: 404 })]
                record(result, 'console', found.length ? 'warn' : 'ok', found, label.trim())
            } finally { await chrome.close() }
        }
        // What the dev servers printed while the pages were opened
        const printed = servers.flatMap((server) => problems(server.output))
        record(result, 'start', printed.length ? 'warn' : 'ok', printed, label.trim())
    } finally {
        servers.forEach(stop)
        await new Promise((done) => setTimeout(done, 1500))
    }
}

async function check(item, chromePort) {
    const project = join(WORK, item.name)
    const log = join(WORK, `${item.name}.log`)
    writeFileSync(log, '')
    const result = { name: item.name, steps: {}, problems: [], upstream: [] }
    rmSync(project, { recursive: true, force: true })
    item.appPort = await freePort(item.appPort)
    item.apiPort = await freePort(item.apiPort)
    if (!await create(item, log)) { result.steps.create = 'fail'; result.problems.push('[create] the engine failed (see the log)'); return result }
    const front = join(project, 'frontend')
    const back = join(project, 'backend')
    // The package.json of a PHP back end (Laravel) only builds its own assets: not the API
    if (existsSync(join(back, 'package.json')) && !isPhp(item)) await checkNode(back, item, result, log, 'api')
    if (isPhp(item)) await checkPhp(back, item, result, log)
    if (existsSync(join(front, 'package.json'))) await checkNode(front, item, result, log, 'front')
    else if (existsSync(join(front, 'js'))) {
        // HTML / CSS / JS: no tooling in the project, at least the syntax of every script (ES modules)
        const files = readdirSync(join(front, 'js'), { recursive: true }).filter((file) => file.endsWith('.js'))
        const bad = []
        for (const file of files) { const r = await run('node', ['--check', join(front, 'js', file)], front, log); if (!r.ok) bad.push(...problems(r.output)) }
        record(result, 'lint', bad.length ? 'fail' : 'ok', bad, 'front')
    }
    await startAndLook(item, project, result, log, chromePort, '')
    // The same front with the design of DC Scaffold turned off (dc-scaffold.config.js)
    const config = join(front, 'dc-scaffold.config.js')
    if (item.design && existsSync(config)) {
        writeFileSync(config, readFileSync(config, 'utf8').replace(/(design\s*:\s*)true/, '$1false'))
        if (existsSync(join(front, 'package.json'))) await checkNode(front, item, result, log, 'front design-off')
        await startAndLook(item, project, result, log, chromePort, ' design-off')
    }
    if (!flag('keep')) rmSync(project, { recursive: true, force: true, maxRetries: 5, retryDelay: 1000 })
    return result
}

function report(results) {
    const lines = ['| Case | ' + STEPS.join(' | ') + ' |', '| --- |' + STEPS.map(() => ' --- |').join('')]
    for (const r of results) lines.push(`| ${r.name}${r.steps.create ? ' (create failed)' : ''} | ${STEPS.map((s) => r.steps[s] ?? '-').join(' | ')} |`)
    const details = results.filter((r) => r.problems.length).flatMap((r) => ['', `### ${r.name}`, '', ...r.problems.map((p) => `- ${p}`)])
    const known = [...new Set(results.flatMap((r) => r.upstream.map((p) => p.replace(/^\[[^\]]*\] /, ''))))]
    if (known.length) details.push('', '## Warnings of the frameworks themselves (upstream)', '', ...known.map((p) => `- ${p}`))
    const text = ['# DC Scaffold: quality check', '', ...lines, ...details, ''].join('\n')
    writeFileSync(join(WORK, 'report.md'), text)
    writeFileSync(join(WORK, 'results.json'), JSON.stringify(results, null, 2))
    console.log(`\n${text}\nReport: ${join(WORK, 'report.md')} (logs next to it)`)
}

async function main() {
    if (!hasCommand('pwsh')) throw new Error('PowerShell 7 (pwsh) is needed to run the engine')
    const catalog = process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'DC Scaffold', 'catalog', 'current', 'catalog.json')
    if (catalog && existsSync(catalog)) {
        const downloaded = JSON.parse(readFileSync(catalog, 'utf8')).version
        const local = readFileSync(join(STACKS, 'version.txt'), 'utf8').trim()
        if (downloaded.localeCompare(local, undefined, { numeric: true }) > 0) {
            console.warn(`!! The downloaded catalog (${downloaded}) is newer than stacks/ (${local}): the engine would use it. Raise stacks/version.txt first.`)
        }
    }
    if (!CHROME && !flag('no-console')) console.warn('!! No Chrome found (CHROME_PATH): the browser console is not checked')
    const cases = matrix()
    if (flag('list')) return cases.forEach((item) => console.log(item.name))
    const skipped = cases.filter((item) => item.back !== 'none' && readStack('backs', item.back).runtime === 'php' && !hasCommand('php'))
    for (const item of skipped) console.warn(`!! ${item.name}: PHP is not installed, skipped`)
    const queue = cases.filter((item) => !skipped.includes(item))
    mkdirSync(WORK, { recursive: true })
    console.log(`${queue.length} case(s) in ${WORK}, ${JOBS} at a time`)
    const results = []
    await Promise.all(Array.from({ length: JOBS }, async (_, job) => {
        for (let item = queue.shift(); item; item = queue.shift()) {
            const started = Date.now()
            const result = await check(item, 9300 + job).catch((error) => ({ name: item.name, steps: { create: 'fail' }, problems: [String(error)], upstream: [] }))
            results.push(result)
            writeFileSync(join(WORK, `${item.name}.json`), JSON.stringify(result, null, 2))
            console.log(`${item.name}: ${STEPS.map((s) => `${s} ${result.steps[s] ?? '-'}`).join(', ')} (${Math.round((Date.now() - started) / 1000)} s)`)
        }
    }))
    results.sort((a, b) => cases.findIndex((c) => c.name === a.name) - cases.findIndex((c) => c.name === b.name))
    report(results)
    process.exitCode = results.some((r) => r.problems.length) ? 1 : 0
}

main().catch((error) => { console.error(error); process.exit(2) })
