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
export type Route = { methods: string[], path: string, pattern: RegExp, handler: (...args: any[]) => any }

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
const routeOf = (ControllerClass: any, action: string): [string[], string] | null => {
    const custom: Record<string, [string, string]> = ControllerClass.routes ?? {}
    const own = custom[action]
    if (Object.hasOwn(custom, action) && own) return [[own[0].toUpperCase()], own[1]]
    return REST_ACTIONS[action] ?? null
}

export const RouteDiscovery = {
    scan(controllers: { name: string, controller: any }[]) {
        const routes: Route[] = []

        for (const { name, controller: ControllerClass } of controllers) {
            const instance = new ControllerClass()
            const prefix = (ControllerClass.prefix ?? defaultPrefix(name)).replace(/\/$/, '')

            for (const action of Object.getOwnPropertyNames(ControllerClass.prototype)) {
                const route = action === 'constructor' ? null : routeOf(ControllerClass, action)
                if (!route) continue

                const path = (prefix + route[1]) || '/'
                routes.push({ methods: route[0], path, pattern: toPattern(path), handler: instance[action].bind(instance) })
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
