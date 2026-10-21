import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

/**
 * Same CORS rules as the other back ends: only the front URL (APP_BASE_URL), with cookies.
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
    enabled: true,
    origin: [env.get('APP_BASE_URL', 'http://localhost:3000')],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    headers: true,
    exposeHeaders: [],
    credentials: true,
    maxAge: 90,
})

export default corsConfig
