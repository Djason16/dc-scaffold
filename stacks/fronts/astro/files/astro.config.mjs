// @ts-check
import { defineConfig } from 'astro/config'

// Static site in dist/ (like "nuxt generate"), uploaded as-is
export default defineConfig({
    server: { port: {{APP_PORT}} },
    trailingSlash: 'always',
    // Base of the site: "/" at the root of its address (dev, production), "/my-site/" in a qualif (scripts/qualif.mjs)
    base: process.env.QUALIF_BASE_URL || '/',
})
