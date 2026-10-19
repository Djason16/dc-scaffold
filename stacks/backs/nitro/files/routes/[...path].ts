import controllers from '#controllers'

// Every controller route, resolved once at startup (see utils/RouteDiscovery.ts)
const routes = RouteDiscovery.scan(controllers)

export default defineEventHandler((event) => {
    const path = getRequestURL(event).pathname.replace(/\/+$/, '') || '/'
    const { route, args, pathExists } = RouteDiscovery.match(routes, event.method, path)

    if (route) return route.handler(event, args)

    // Formatted as JSON by error.ts
    throw createError({ statusCode: pathExists ? 405 : 404 })
})
