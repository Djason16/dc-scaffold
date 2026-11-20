// ESLint (npm run lint): the recommended rules of JavaScript and Astro (eslint-plugin-astro)
import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
    globalIgnores(['dist/**', '.astro/**', 'qualif/**']),
    js.configs.recommended,
    astro.configs.recommended,
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    // CommonJS files (server.cjs)
    { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs' } },
])
