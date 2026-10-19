// @ts-check
import { defineConfig } from 'astro/config'

// Static site in dist/ (like "nuxt generate"), uploaded as-is
export default defineConfig({
    server: { port: {{APP_PORT}} },
    trailingSlash: 'always',
})
