import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
    // Base of the site: "/" at the root of its address (dev, production), "/my-site/" in a qualif (scripts/qualif.mjs)
    base: process.env.QUALIF_BASE_URL || '/',
    server: { port: {{APP_PORT}}, strictPort: true },
    plugins: [solid()],
    // "@/..." = src/... (same imports as the other fronts)
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
