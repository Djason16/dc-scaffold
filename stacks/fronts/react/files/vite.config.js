import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    server: { port: {{APP_PORT}}, strictPort: true },
    plugins: [react()],
    // "@/..." = src/... (same imports as in Next.js)
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
