import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
    server: { port: {{APP_PORT}}, strictPort: true },
    plugins: [solid()],
    // "@/..." = src/... (same imports as the other fronts)
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
