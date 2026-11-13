// Changes package.json like "npm pkg set / delete", for any value (quotes, spaces, &&...): the "npm" step of stack.json.
//   node package-json.mjs <folder>   with DCS_PKG = { "set": { "scripts.build": "..." }, "delete": ["scripts.x"] }
// Keys with dots are paths ("scripts.build", "imports.#lib/*"); the layout of npm (2 spaces) is kept.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const file = join(process.argv[2], 'package.json')
const pkg = JSON.parse(readFileSync(file, 'utf8'))
const { set = {}, delete: remove = [] } = JSON.parse(process.env.DCS_PKG ?? '{}')

// "scripts.build" -> ['scripts', 'build']; "imports.#lib/*" -> ['imports', '#lib/*'] (only the first dots of known objects)
const path = (key) => {
    // "scripts[build.server]": a name with dots, between brackets (same syntax as npm pkg)
    const bracket = key.match(/^([^[\]]+)\[([^\]]+)\]$/)
    if (bracket) return [bracket[1], bracket[2]]
    const [head, ...rest] = key.split('.')
    return rest.length && ['scripts', 'dependencies', 'devDependencies', 'imports', 'exports', 'engines', 'overrides'].includes(head)
        ? [head, rest.join('.')]
        : key.split('.')
}
for (const key of remove) {
    const parts = path(key)
    const parent = parts.slice(0, -1).reduce((node, part) => node?.[part], pkg)
    if (parent) delete parent[parts.at(-1)]
}
for (const [key, value] of Object.entries(set)) {
    const parts = path(key)
    const parent = parts.slice(0, -1).reduce((node, part) => (node[part] ??= {}), pkg)
    parent[parts.at(-1)] = value
}
writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n')
