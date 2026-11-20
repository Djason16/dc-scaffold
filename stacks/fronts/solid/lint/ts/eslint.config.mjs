// ESLint (npm run lint): the recommended rules of JavaScript, TypeScript and Solid (eslint-plugin-solid)
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import solid from 'eslint-plugin-solid/configs/typescript'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
    globalIgnores(['dist/**', 'qualif/**']),
    js.configs.recommended,
    tseslint.configs.recommended,
    { files: ['**/*.{ts,tsx}'], ...solid },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
])
