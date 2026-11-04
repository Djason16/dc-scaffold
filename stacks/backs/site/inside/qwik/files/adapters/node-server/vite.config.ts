import { nodeServerAdapter } from '@builder.io/qwik-city/adapters/node-server/vite'
import { extendConfig } from '@builder.io/qwik-city/vite'
import { loadEnv } from 'vite'
import baseConfig from '../../vite.config'

// Node.js server in server/ (npm start): the pages of src/routes are still written as HTML files in dist/,
// the API (src/routes/api) answers on each request. origin = address of the site online: PUBLIC_SITE_URL of .env.production
const env = loadEnv('production', process.cwd(), '')

export default extendConfig(baseConfig, () => {
    return {
        build: {
            ssr: true,
            rollupOptions: {
                input: ['src/entry.node-server.tsx', '@qwik-city-plan'],
            },
        },
        plugins: [
            nodeServerAdapter({
                name: 'node-server',
                ssg: {
                    include: ['/*'],
                    exclude: ['/api/*'],
                    origin: env.PUBLIC_SITE_URL || 'https://example.com',
                },
            }),
        ],
    }
})
