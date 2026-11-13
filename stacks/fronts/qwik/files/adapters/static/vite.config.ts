import { staticAdapter } from '@builder.io/qwik-city/adapters/static/vite'
import { extendConfig } from '@builder.io/qwik-city/vite'
import { loadEnv } from 'vite'
import baseConfig from '../../vite.config'

// Static site in dist/ (like "nuxt generate"): every page of src/routes is written as an HTML file.
// origin = address of the site online: PUBLIC_SITE_URL of .env.production (the one of .env.preprod in a qualif)
const env = { ...loadEnv('production', process.cwd(), ''), ...(process.env.QUALIF_BASE_URL ? process.env : {}) }

export default extendConfig(baseConfig, () => {
    return {
        build: {
            ssr: true,
            rollupOptions: {
                input: ['@qwik-city-plan'],
            },
        },
        plugins: [
            staticAdapter({
                origin: new URL(env.PUBLIC_SITE_URL || 'https://example.com').origin,
            }),
        ],
    }
})
