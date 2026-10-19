// Writes {{DESIGN_JS}} and {{DESIGN_CSS}} from dc-scaffold.config.js, before "npm run dev" and every build
// (the pre... scripts of package.json): change dc-scaffold.config.js, not these two files.
//   design: true   both files point to the DC Scaffold design ({{DESIGN_FOLDER}})
//   design: false  both are empty: the welcome page, the theme and the fonts of DC Scaffold stay out of the build
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative } from 'node:path'

const config = existsSync('dc-scaffold.config.js') ? readFileSync('dc-scaffold.config.js', 'utf8') : ''
// "design: false" turns it off; no file or no line: on
const design = !/^\s*design\s*:\s*false\b/m.test(config)

const note = '{{DESIGN_NOTE}}'.replace('{0}', design)
const header = (file) => file.endsWith('.css') ? `/* ${note} */\n` : `// ${note}\n`
const path = (from, to) => relative(dirname(from), to).split('\\').join('/').replace(/^(?!\.)/, './')

const files = {
    '{{DESIGN_JS}}': design
        ? `export * from '${path('{{DESIGN_JS}}', '{{DESIGN_FOLDER}}/index{{DESIGN_INDEX_EXT}}')}'\n`
        : [
            'export const design = false',
            '/** @type {any[] | null} */',
            'export const welcome = null',
            '',
        ].join('\n'),
    '{{DESIGN_CSS}}': design ? `@import "${path('{{DESIGN_CSS}}', '{{DESIGN_FOLDER}}/theme.css')}";\n` : '',
}
{{DESIGN_TEXTS_CODE}}
for (const [file, content] of Object.entries(files)) {
    const text = header(file) + content
    // Same content: the file is not touched (no reload of the dev server)
    if (!existsSync(file) || readFileSync(file, 'utf8') !== text) writeFileSync(file, text)
}
console.log(design ? '{{DESIGN_LOG_ON}}' : '{{DESIGN_LOG_OFF}}')
