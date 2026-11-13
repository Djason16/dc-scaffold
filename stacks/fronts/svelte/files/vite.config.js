import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
    // Base of the site: "/" at the root of its address (dev, production), "/my-site/" in a qualif (scripts/qualif.mjs)
    base: process.env.QUALIF_BASE_URL || '/',
    server: { port: {{APP_PORT}}, strictPort: true },
    plugins: [svelte()],
})
