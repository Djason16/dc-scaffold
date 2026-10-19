// Writes src/environments/environment.ts from .env (npm run dev) or .env.production (npm run build).
// Angular does not read .env files: this keeps the same settings files as the other fronts of DC Scaffold.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const production = process.argv.includes('--production')
const file = production ? '.env.production' : '.env'

// NAME=value lines (quotes around the value are removed)
const values = {}
for (const line of existsSync(file) ? readFileSync(file, 'utf8').split(/\r?\n/) : []) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (match) values[match[1]] = match[2].replace(/^["']|["']$/g, '')
}

const environment = {
    production,
    siteName: values.SITE_NAME ?? '',
    siteUrl: values.SITE_URL ?? '',
    apiUrl: values.API_URL ?? '',
}
const header = `// Written by scripts/env.mjs from ${file}: change ${file}, not this file\n`
writeFileSync('src/environments/environment.ts', `${header}export const environment = ${JSON.stringify(environment, null, 4)}\n`)
console.log(`env: ${file} -> src/environments/environment.ts`)
