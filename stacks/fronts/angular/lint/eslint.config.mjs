// ESLint (npm run lint): the configuration of angular-eslint (recommended rules of JavaScript, TypeScript, Angular,
// and of the templates with their accessibility)
import js from '@eslint/js'
import angular from 'angular-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
    globalIgnores(['dist/**', '.angular/**', 'qualif/**']),
    {
        files: ['**/*.ts'],
        extends: [js.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic, angular.configs.tsRecommended],
        processor: angular.processInlineTemplates,
    },
    {
        files: ['**/*.html'],
        extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    },
    // Scripts of the project (scripts/*.mjs), run by Node.js
    {
        files: ['**/*.{js,mjs,cjs}'],
        extends: [js.configs.recommended],
        languageOptions: { globals: globals.node },
    },
])
