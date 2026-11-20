// ESLint (npm run lint): the recommended rules of JavaScript, Node.js globals
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
    globalIgnores(['.output/**', '.nitro/**', 'uploads/**', 'database/**']),
    js.configs.recommended,
    {
        languageOptions: { globals: globals.node },
        // The functions of Nitro and of utils/ are imported automatically (defineEventHandler, ResponseHelper...):
        // ESLint cannot see them, TypeScript checks them in a TypeScript project (no-undef is off there too)
        rules: { 'no-undef': 'off' },
    },
    // CommonJS files (server.cjs)
    { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs' } },
])
