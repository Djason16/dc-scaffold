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
const REST_ACTIONS = {
    getAll: [['GET'], ''],
    getOne: [['GET'], '/{id}'],
    create: [['POST'], ''],
    update: [['PUT', 'PATCH'], '/{id}'],
    delete: [['DELETE'], '/{id}'],
}

// ProductsController -> /products
const defaultPrefix = (name) =>
    '/' + name.replace(/Controller$/, '').replace(/(?<!^)[A-Z]/g, '-$&').toLowerCase()

// '/products/{id}' -> /^\/products\/(?<id>[^/]+)$/
const toPattern = (path) => new RegExp(`^${path.replace(/\{(\w+)\}/g, '(?<$1>[^/]+)')}$`)

// [HTTP methods, path] for a controller method, or null when it is not a route
const routeOf = (ControllerClass, action) => {
    const custom = ControllerClass.routes ?? {}
    if (Object.hasOwn(custom, action)) return [[custom[action][0].toUpperCase()], custom[action][1]]
    return Object.hasOwn(REST_ACTIONS, action) ? REST_ACTIONS[action] : null
}

export const RouteDiscovery = {
    /** @param {{ name: string, controller: any }[]} controllers */
    scan(controllers) {
        const routes = []

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
    match(routes, method, path) {
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
