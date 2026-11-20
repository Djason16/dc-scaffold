import type { H3Event } from 'h3'
import controllers from '#controllers'

// Every controller route, resolved once at startup (see server/utils/RouteDiscovery.ts)
const routes = RouteDiscovery.scan(controllers)

// Every error of the API in the shared JSON format (the pages of the site keep the error page of Nuxt)
const sendError = (event: H3Event, error: unknown) => {
    // An error of h3 (createError) has its status; any other one is an error of the server
    const { statusCode = 500, statusMessage = '', message = '' } = (error ?? {}) as { statusCode?: number, statusMessage?: string, message?: string }
    if (statusCode >= 500) console.error('[API]', error)
    // Real message in development only, never leak internals in production
    const text = statusCode >= 500 ? (import.meta.dev ? message : 'Internal server error') : statusMessage || message
    return ResponseHelper.error(event, text, statusCode, statusCode >= 500 ? 'SERVER_ERROR' : 'HTTP_ERROR')
}

// /api/products -> ProductsController
export default defineEventHandler(async (event) => {
    // Everything up to /api goes away, the folder of a qualif too (/my-site/api/products -> /products)
    const path = getRequestURL(event).pathname.replace(/^.*?\/api(?=\/|$)/, '').replace(/\/+$/, '') || '/'
    const { route, args, pathExists } = RouteDiscovery.match(routes, event.method, path)

    if (!route) {
        return pathExists
            ? ResponseHelper.error(event, 'Method not allowed', 405, 'METHOD_NOT_ALLOWED')
            : ResponseHelper.error(event, 'Route not found', 404, 'NOT_FOUND', { path: getRequestURL(event).pathname })
    }

    try {
        return await route.handler(event, args)
    } catch (error) {
        return sendError(event, error)
    }
})
