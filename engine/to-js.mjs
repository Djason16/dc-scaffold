// JavaScript version of a project written in TypeScript (DC Scaffold, "JavaScript" chosen at the creation).
// The models of the stacks are written once, in TypeScript; this script removes the types and keeps everything else as
// written: comments, blank lines, quotes, indentation. The parser of TypeScript finds the types (ts-blank-space), they
// are blanked, then the blanks are taken out of the text.
//   node to-js.mjs <folder or file>...   (DCS_TOOLS = folder where ts-blank-space and typescript are installed)
// Converted: .ts / .mts / .tsx (-> .js / .mjs / .jsx), <script lang="ts"> of .vue, .svelte and .astro files.
// Removed: the .d.ts files (types only). Left as they are: node_modules, .nuxt, .output, dist and the configuration files
// that a tool reads in TypeScript only (none today: nuxt.config, vite.config... become .js like the rest).
import { existsSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { createRequire } from 'node:module'

// ts-blank-space (Bloomberg) + TypeScript, installed by DC Scaffold in its settings folder (DCS_TOOLS): the types are
// replaced by blanks, .tsx files included; the blanks are then taken out below
const tools = createRequire(join(process.env.DCS_TOOLS ?? process.cwd(), 'package.json'))
const ts = tools('typescript')
const { blankSourceFile } = tools('ts-blank-space')
const blank = (source, tsx) => {
    const file = ts.createSourceFile(tsx ? 'file.tsx' : 'file.ts', source, ts.ScriptTarget.ESNext, false, tsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
    return blankSourceFile(file, (node) => { throw new Error(`Not convertible TypeScript at ${source.slice(0, node.pos).split('\n').length}: ${node.getText(file).slice(0, 80)}`) })
}

const SKIP = new Set(['node_modules', '.nuxt', '.output', '.next', '.svelte-kit', '.astro', 'dist', 'build', 'vendor', '.git'])
const RENAME = { '.ts': '.js', '.mts': '.mjs', '.cts': '.cjs', '.tsx': '.jsx' }

// Characters around a removed type that may go with it: "x as any)" -> "x)", "a , b" never happens (types never sit there)
const CLOSING = /[)\],;.}>\n]|$/

/**
 * Takes the blanked parts out: every place where the original text had something and the stripped one has only spaces.
 * @param {string} source  TypeScript
 * @returns {string} JavaScript
 */
export function toJs(source, tsx = false) {
    const stripped = blank(source, tsx)
    let out = ''
    let i = 0
    while (i < source.length) {
        if (source[i] === stripped[i]) { out += source[i++]; continue }
        // A removed part: up to the next character that is the same in both texts and is not a blank of the removed part
        let end = i
        while (end < source.length && (source[end] !== stripped[end] || (/[ \t]/.test(source[end]) && end + 1 < source.length && source[end + 1] !== stripped[end + 1]))) end++
        // The space before it goes too when nothing follows on the same token ("x as any)" -> "x)", "class A implements B {" -> "class A {")
        const next = source[end] ?? ''
        if (/[ \t]$/.test(out) && (CLOSING.test(next) || /[ \t]/.test(next))) out = out.replace(/[ \t]+$/, '')
        // A line that held only a type (interface, "import type", overload) disappears with its line break
        const lineStart = out.lastIndexOf('\n') + 1
        if (out.slice(lineStart).trim() === '' && (next === '\n' || next === '\r' || next === '')) {
            out = out.slice(0, lineStart)
            end += source[end] === '\r' ? 2 : 1
            // Its indentation was before it: already removed with out.slice. The comment right above it described the
            // type: it goes with it ("// The store the actions work on" over "type Store = {...}")
            // ("import type" lines excepted: the comment above them is the one of the file)
            if (!/^\s*import\b/.test(source.slice(i, end))) {
                out = out.replace(/(?:^|\n)(?:[ \t]*\/\/[^\n]*\n)+$|(?:^|\n)[ \t]*\/\*\*(?:(?!\*\/)[\s\S])*\*\/[ \t]*\n$/, (comment) => (comment.startsWith('\n') ? '\n' : ''))
            }
        }
        // "(this: Store, chosen)" -> "( chosen)" -> "(chosen)"
        if (/\($/.test(out) && /[ \t]/.test(source[end] ?? '')) while (/[ \t]/.test(source[end] ?? '')) end++
        i = end
    }
    // ".ts" in the imports of the project: "./helper.ts" -> "./helper.js"
    return out
        .replace(/(from\s+|import\s*\(\s*|import\s+)(['"])(\.{1,2}\/[^'"]+?)\.(m|c)?tsx?\2/g, (_, before, quote, path, kind) => `${before}${quote}${path}.${kind ?? ''}js${quote}`)
        // "(value as Type).name" -> "(value).name" -> "value.name", and the ";" written before such a line in TypeScript
        .replace(/(^|[^\w$\])])\(([\w$]+(?:\.[\w$]+)*)\)(?=[.[])/gm, '$1$2')
        .replace(/^([ \t]*);(?=[\w$])/gm, '$1')
        // More than one blank line left where several type lines were, none at the top
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s*\n/, '')
}

/** <script lang="ts"> of a .vue / .svelte file, and the frontmatter of an .astro file */
function convertComponent(text, file) {
    let result = text.replace(/(<script\b[^>]*?)\s+lang=["']ts["']([^>]*>)([\s\S]*?)(<\/script>)/g, (_, open, rest, code, close) => `${open}${rest}${toJs(code)}${close}`)
    if (file.endsWith('.astro')) result = result.replace(/^---\n([\s\S]*?)\n---/, (_, code) => `---\n${toJs(code).trimEnd()}\n---`)
    // <template lang="ts">... does not exist; generic="T" of a Vue component is TypeScript only
    return result.replace(/(<script\b[^>]*?)\s+generic=["'][^"']*["']/g, '$1')
}

// Names of the files in the texts: "utils/seo.ts", 'nuxt.config.ts', `api.ts` -> .js (a path with a "/", or between quotes)
const fixPaths = (text) => text
    // Configuration files named alone: "nuxt.config.ts", "vite.config.ts"
    .replace(/\b([\w-]+\.config)\.(m?)ts\b/g, '$1.$2js')
    // A file of the folder named with "./": "node ./server.ts" in the scripts of package.json
    .replace(/(^|[\s(=,])(\.{1,2}\/[\w.@-]+?)\.(m|c)?ts(x?)(?![\w-])/gm, (all, before, path, k, x) => (path.endsWith('.d') ? all : `${before}${path}.${k ?? ''}js${x}`))
    .replace(/(^|[\s(=,])((?:\.{0,2}\/)?[\w@-][\w.@-]*\/[\w./@[\]-]*?)\.(m|c)?ts(x?)(?![\w-])/gm, (all, before, path, k, x) => (path.endsWith('.d') ? all : `${before}${path}.${k ?? ''}js${x}`))
    .replace(/(['"`])((?:\.{0,2}\/)?[\w@#$[\]-][\w./@[\]-]*?)\.(m|c)?ts(x?)\1/g, (all, quote, path, k, x) => (path.endsWith('.d') ? all : `${quote}${path}.${k ?? ''}js${x}${quote}`))

const TEXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.html', '.md', '.vue', '.svelte', '.astro'])

function convert(path) {
    const name = path.split(/[\\/]/).pop()
    if (name.endsWith('.d.ts')) { rmSync(path); return }
    const ext = extname(name)
    if (RENAME[ext]) {
        writeFileSync(path, fixPaths(toJs(readFileSync(path, 'utf8'), ext === '.tsx')))
        renameSync(path, path.slice(0, -ext.length) + RENAME[ext])
        return
    }
    if (!TEXT.has(ext) && name !== 'package.json' && name !== '.gitignore') return
    const text = readFileSync(path, 'utf8')
    let fixed = ['.vue', '.svelte', '.astro'].includes(ext) ? convertComponent(text, name) : text
    // Paths written with .ts (scripts of package.json, imports, comments, README, .gitignore)
    fixed = fixPaths(fixed)
    if (fixed !== text) writeFileSync(path, fixed)
}

function walk(dir, each = convert) {
    for (const name of readdirSync(dir)) {
        if (SKIP.has(name)) continue
        const path = join(dir, name)
        if (statSync(path).isDirectory()) walk(path, each)
        else each(path)
    }
}

// The relative imports written without extension get theirs back ("./seo" -> "./seo.js"): a site without build runs
// them in the browser, which needs it, and every JavaScript project reads the same way
const RELATIVE = /((?:from\s+|import\s*\(\s*|import\s+)['"])(\.{1,2}\/[^'"]+?)(['"])/g
function addExtensions(path) {
    if (!/\.(m?js|jsx)$/.test(path)) return
    const dir = path.replace(/[\\/][^\\/]+$/, '')
    const text = readFileSync(path, 'utf8')
    const fixed = text.replace(RELATIVE, (all, head, spec, quote) => {
        if (/\.\w+$/.test(spec)) return all
        const found = ['.js', '.jsx', '.mjs'].find((ext) => existsSync(join(dir, spec + ext)))
        return found ? `${head}${spec}${found}${quote}` : all
    })
    if (fixed !== text) writeFileSync(path, fixed)
}

if (process.argv[1]?.endsWith('to-js.mjs')) {
    const targets = process.argv.slice(2).filter((target) => existsSync(target))
    for (const target of targets) {
        if (statSync(target).isDirectory()) walk(target)
        else convert(target)
    }
    for (const target of targets) if (statSync(target).isDirectory()) walk(target, addExtensions)
}
