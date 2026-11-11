import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    // Base of the site: "/" at the root of its address (dev, production), "/my-site/" in a qualif (scripts/qualif.mjs)
    base: process.env.QUALIF_BASE_URL || '/',
    server: { port: {{APP_PORT}}, strictPort: true },
    plugins: [react()],
    // "@/..." = src/... (same imports as in Next.js)
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
