import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
    // Base of the site: "/" at the root of its address (dev, production), "/my-site/" in a qualif (scripts/qualif.mjs)
    base: process.env.QUALIF_BASE_URL || '/',
    server: { port: {{APP_PORT}}, strictPort: true },
    plugins: [vue(), vueDevTools()],
    // "@/..." = src/... (same imports as in Nuxt)
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
