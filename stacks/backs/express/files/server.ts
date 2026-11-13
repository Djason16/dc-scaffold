import { readdirSync } from 'node:fs'
import express from 'express'
import { cors } from './middleware/cors.ts'
import { errorHandler } from './middleware/errors.ts'
import { ResponseHelper } from './utils/ResponseHelper.ts'
import { RouteDiscovery } from './utils/RouteDiscovery.ts'
import { SecurityHelper } from './utils/SecurityHelper.ts'

const app = express()
// No "X-Powered-By: Express" header (the server used is not shown to everyone)
app.disable('x-powered-by')
// One proxy in front (the host): req.ip = last entry of X-Forwarded-For, req.secure = HTTPS of the visitor
app.set('trust proxy', 1)

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/
// Security headers on every answer, errors included (utils/SecurityHelper.ts)
app.use((req, res, next) => {
    res.set(SecurityHelper.headers(req.secure))
    next()
})
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
| Controller routes, built from controllers/ (see utils/RouteDiscovery.ts)
|--------------------------------------------------------------------------
*/
const files = readdirSync(new URL('./controllers', import.meta.url)).filter((file) => /Controller\.[jt]s$/.test(file))
const controllers = await Promise.all(
    files.map(async (file) => ({ name: file.replace(/\.[jt]s$/, ''), controller: (await import(`./controllers/${file}`)).default })),
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
