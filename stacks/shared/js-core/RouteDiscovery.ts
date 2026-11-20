/**
 * Builds the routes from the controllers (same rules as the PHP back ends).
 *
 * ProductsController -> prefix /products (FieldActionsController -> /field-actions)
 *   getAll()   GET          /products
 *   getOne()   GET          /products/{id}
 *   create()   POST         /products
 *   update()   PUT, PATCH   /products/{id}
 *   delete()   DELETE       /products/{id}
 *
 * Any other method becomes a route through: static routes = { markShipped: ['POST', '/{id}/mark-shipped'] }
 */
// An action of a controller, bound to its instance: its arguments depend on the framework (request, response...)
export type Handler = (...args: unknown[]) => unknown
export type Route = { methods: string[], path: string, pattern: RegExp, handler: Handler }
// A controller class: its optional prefix and custom routes (static), and its actions
export type ControllerClass = (new () => object) & { prefix?: string, routes?: Record<string, [string, string]> }

const REST_ACTIONS: Record<string, [string[], string]> = {
    getAll: [['GET'], ''],
    getOne: [['GET'], '/{id}'],
    create: [['POST'], ''],
    update: [['PUT', 'PATCH'], '/{id}'],
    delete: [['DELETE'], '/{id}'],
}

// ProductsController -> /products
const defaultPrefix = (name: string) =>
    '/' + name.replace(/Controller$/, '').replace(/(?<!^)[A-Z]/g, '-$&').toLowerCase()

// '/products/{id}' -> /^\/products\/(?<id>[^/]+)$/
const toPattern = (path: string) => new RegExp(`^${path.replace(/\{(\w+)\}/g, '(?<$1>[^/]+)')}$`)

// [HTTP methods, path] for a controller method, or null when it is not a route
const routeOf = (ControllerClass: ControllerClass, action: string): [string[], string] | null => {
    const custom: Record<string, [string, string]> = ControllerClass.routes ?? {}
    const own = custom[action]
    if (Object.hasOwn(custom, action) && own) return [[own[0].toUpperCase()], own[1]]
    return REST_ACTIONS[action] ?? null
}

export const RouteDiscovery = {
    scan(controllers: { name: string, controller: ControllerClass }[]) {
        const routes: Route[] = []

        for (const { name, controller: ControllerClass } of controllers) {
            const instance = new ControllerClass() as Record<string, Handler>
            const prefix = (ControllerClass.prefix ?? defaultPrefix(name)).replace(/\/$/, '')

            for (const action of Object.getOwnPropertyNames(ControllerClass.prototype)) {
                const route = action === 'constructor' ? null : routeOf(ControllerClass, action)
                const handler = instance[action]
                if (!route || !handler) continue

                const path = (prefix + route[1]) || '/'
                routes.push({ methods: route[0], path, pattern: toPattern(path), handler: handler.bind(instance) })
            }
        }

        // Fixed paths first, so /products/export is not caught by /products/{id}
        return routes.sort((a, b) => a.path.split('{').length - b.path.split('{').length)
    },

    /** Finds the route for a request; pathExists tells a 405 from a 404 */
    match(routes: Route[], method: string, path: string) {
        let pathExists = false

        for (const route of routes) {
            const match = route.pattern.exec(path)
            if (!match) continue
            pathExists = true
            if (route.methods.includes(method)) return { route, args: { ...match.groups }, pathExists }
        }

        return { route: null, args: {}, pathExists }
    },
}
