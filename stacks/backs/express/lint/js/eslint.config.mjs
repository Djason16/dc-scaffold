// ESLint (npm run lint): the recommended rules of JavaScript, Node.js globals
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
    globalIgnores(['build/**', 'uploads/**', 'database/**']),
    js.configs.recommended,
    { languageOptions: { globals: globals.node } },
    // CommonJS files (server.cjs)
    { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs' } },
    // An error handler of Express has four parameters, the last ones sometimes unused: _next and the like are allowed
    { rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } },
])
