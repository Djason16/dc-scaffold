/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The base route, the accounts of the AdonisJS API kit, then the routes
| built from app/controllers (same rules as the other back ends).
|
*/

import { readdirSync } from 'node:fs'
import router from '@adonisjs/core/services/router'
import { RouteDiscovery } from '#core/RouteDiscovery'
import { controllers } from '#generated/controllers'
import { ResponseHelper } from '#helpers/response_helper'
import { middleware } from '#start/kernel'

/*
|--------------------------------------------------------------------------
| Base route
|--------------------------------------------------------------------------
*/
router.get('/', ({ response }) =>
    ResponseHelper.success(response, {
        message: 'API ready',
        name: process.env.APP_NAME ?? 'API',
        environment: process.env.NODE_ENV ?? 'development',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        current_time: new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Paris' }),
    }),
)

/*
|--------------------------------------------------------------------------
| User accounts (AdonisJS API kit): sign up, log in, profile, log out
| Their tables are created by: node ace migration:run
|--------------------------------------------------------------------------
*/
router
    .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
    })
    .prefix('auth')
    .as('auth')

router
    .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
    })
    .prefix('account')
    .as('profile')
    .use(middleware.auth())

/*
|--------------------------------------------------------------------------
| Controller routes, built from app/controllers (see app/core/RouteDiscovery.js)
|--------------------------------------------------------------------------
*/
const folder = new URL('../app/controllers/', import.meta.url)
const files = readdirSync(folder).filter((file) => /_controller\.(ts|js)$/.test(file))
const routes = RouteDiscovery.scan(await Promise.all(files.map(async (file) => {
    const controller = (await import(`#controllers/${file.replace(/\.(ts|js)$/, '')}`)).default
    return { name: controller.name, controller }
})))

for (const route of routes) {
    router.route(route.path.replace(/\{(\w+)\}/g, ':$1'), route.methods, (ctx) => route.handler(ctx))
}

// Any other address: 405 when the path exists with another method, 404 otherwise
router.any('*', ({ request, response }) => {
    const path = request.url().replace(/\/+$/, '') || '/'
    return RouteDiscovery.match(routes, request.method(), path).pathExists
        ? ResponseHelper.error(response, 'Method not allowed', 405, 'METHOD_NOT_ALLOWED')
        : ResponseHelper.error(response, 'Route not found', 404, 'NOT_FOUND', { path })
})
