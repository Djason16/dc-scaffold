import { existsSync } from 'node:fs'
import { controllers } from './controllers'
import { ResponseHelper } from './ResponseHelper'
import { RouteDiscovery } from './RouteDiscovery'
import { SecurityHelper } from './SecurityHelper'

// Settings of the API (DB_*): .env in development, .env.production online (read by "npm start")
if (!process.env.DB_CONNECTION && existsSync('.env')) process.loadEnvFile('.env')

// APP_ENV of .env / .env.production (NODE_ENV is not always set by the servers of the frameworks)
const isDev = (process.env.APP_ENV ?? 'development') !== 'production'

// Every controller route, resolved once at startup (see RouteDiscovery.ts)
const routes = RouteDiscovery.scan(controllers)

/**
 * Answers every request of /api: GET /api (base route), then the routes of the controllers.
 * Every error is in the shared JSON format (the pages of the site keep their own error page).
 */
export async function handleApi(request: Request): Promise<Response> {
    // Security headers on every answer of the API, errors included (SecurityHelper.ts); a copy when its headers are locked
    const isHttps = new URL(request.url).protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https'
    const headers = Object.entries(SecurityHelper.headers(isHttps))
    let response = await answer(request)
    try {
        for (const [name, value] of headers) response.headers.set(name, value)
    } catch {
        response = new Response(response.body, response)
        for (const [name, value] of headers) response.headers.set(name, value)
    }
    return response
}

async function answer(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url)
    // Everything up to /api goes away, the folder of a qualif too (/my-site/api/products -> /products)
    const path = pathname.replace(/^.*?\/api(?=\/|$)/, '').replace(/\/+$/, '') || '/'

    if (path === '/' && request.method === 'GET') {
        return ResponseHelper.success({
            message: 'API ready',
            name: process.env.APP_NAME ?? 'API',
            environment: process.env.APP_ENV ?? 'development',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            current_time: new Date().toLocaleString('sv-SE', { timeZone: process.env.DB_TIMEZONE ?? 'Europe/Paris' }),
        })
    }

    const { route, args, pathExists } = RouteDiscovery.match(routes, request.method, path)
    if (!route) {
        return pathExists
            ? ResponseHelper.error('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
            : ResponseHelper.error('Route not found', 404, 'NOT_FOUND', { path: pathname })
    }

    try {
        return await route.handler(request, args)
    } catch (error) {
        console.error('[API]', error)
        // Real message in development only, never leak internals in production
        const message = isDev && error instanceof Error ? error.message : 'Internal server error'
        return ResponseHelper.serverError(message)
    }
}
