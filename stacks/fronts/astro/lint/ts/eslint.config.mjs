// ESLint (npm run lint): the recommended rules of JavaScript, TypeScript and Astro (eslint-plugin-astro)
import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
    globalIgnores(['dist/**', '.astro/**', 'qualif/**']),
    js.configs.recommended,
    tseslint.configs.recommended,
    astro.configs.recommended,
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    // CommonJS files (server.cjs) load their modules with require()
    { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs' }, rules: { '@typescript-eslint/no-require-imports': 'off' } },
])
