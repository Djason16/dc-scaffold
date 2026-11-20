// ESLint (npm run lint): the recommended rules of JavaScript and TypeScript, Node.js globals
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
    globalIgnores(['.output/**', '.nitro/**', 'uploads/**', 'database/**']),
    js.configs.recommended,
    tseslint.configs.recommended,
    { languageOptions: { globals: globals.node } },
    // CommonJS files (server.cjs) load their modules with require()
    { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs' }, rules: { '@typescript-eslint/no-require-imports': 'off' } },
])
