import { readdirSync } from 'node:fs'
import express from 'express'
import { cors } from './middleware/cors.js'
import { errorHandler } from './middleware/errors.js'
import { ResponseHelper } from './utils/ResponseHelper.js'
import { RouteDiscovery } from './utils/RouteDiscovery.js'

const app = express()

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors)

/*
|--------------------------------------------------------------------------
| Base route
|--------------------------------------------------------------------------
*/
app.get('/', (req, res) =>
    ResponseHelper.success(res, {
        message: 'API ready',
        name: process.env.APP_NAME ?? 'API',
        environment: process.env.APP_ENV ?? 'development',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        current_time: new Date().toLocaleString('sv-SE', { timeZone: process.env.DB_TIMEZONE ?? 'Europe/Paris' }),
    }),
)

/*
|--------------------------------------------------------------------------
| Controller routes, built from controllers/ (see utils/RouteDiscovery.js)
|--------------------------------------------------------------------------
*/
const files = readdirSync(new URL('./controllers', import.meta.url)).filter((file) => /Controller\.js$/.test(file))
const controllers = await Promise.all(
    files.map(async (file) => ({ name: file.replace(/\.js$/, ''), controller: (await import(`./controllers/${file}`)).default })),
)
const routes = RouteDiscovery.scan(controllers)

app.use(async (req, res, next) => {
    const path = req.path.replace(/\/+$/, '') || '/'
    const { route, args, pathExists } = RouteDiscovery.match(routes, req.method, path)

    if (!route) {
        return pathExists
            ? ResponseHelper.error(res, 'Method not allowed', 405, 'METHOD_NOT_ALLOWED')
            : ResponseHelper.error(res, 'Route not found', 404, 'NOT_FOUND', { path })
    }

    try {
        await route.handler(req, res, args)
    } catch (error) {
        next(error)
    }
})

app.use(errorHandler)

/*
|--------------------------------------------------------------------------
| Run
|--------------------------------------------------------------------------
*/
const port = Number(process.env.PORT || 3000)
app.listen(port, () => console.log(`API ready on http://localhost:${port}`))
