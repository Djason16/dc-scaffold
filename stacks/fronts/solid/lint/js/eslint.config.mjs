// ESLint (npm run lint): the recommended rules of JavaScript and Solid (eslint-plugin-solid)
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import solid from 'eslint-plugin-solid/configs/recommended'
import globals from 'globals'

export default defineConfig([
    globalIgnores(['dist/**', 'qualif/**']),
    js.configs.recommended,
    { files: ['**/*.{js,jsx}'], ...solid },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
])
