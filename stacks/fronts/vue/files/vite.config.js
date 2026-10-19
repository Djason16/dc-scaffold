import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
    server: { port: {{APP_PORT}}, strictPort: true },
    plugins: [vue(), vueDevTools()],
    // "@/..." = src/... (same imports as in Nuxt)
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
