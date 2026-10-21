import { existsSync, readdirSync } from 'node:fs'
import { All, Controller, Get, Req, Res } from '@nestjs/common'
import type { Request, Response } from 'express'
import { ResponseHelper } from './utils/ResponseHelper.js'
import { RouteDiscovery } from './utils/RouteDiscovery.js'

// Every controller of controllers/ (compiled into dist/controllers), read once at startup (see utils/RouteDiscovery.js)
const folder = new URL('./controllers/', import.meta.url)
const files = existsSync(folder) ? readdirSync(folder).filter((file) => file.endsWith('Controller.js')) : []
const routes = RouteDiscovery.scan(await Promise.all(files.map(async (file) => ({
    name: file.replace(/\.js$/, ''),
    controller: (await import(new URL(file, folder).href)).default,
}))))

// Routes of the API: the base route, then the routes built from controllers/
@Controller()
export class RoutesController {
    /*
    |--------------------------------------------------------------------------
    | Base route
    |--------------------------------------------------------------------------
    */
    @Get()
    home(@Res() res: Response) {
        return ResponseHelper.success(res, {
            message: 'API ready',
            name: process.env.APP_NAME ?? 'API',
            environment: process.env.APP_ENV ?? 'development',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            current_time: new Date().toLocaleString('sv-SE', { timeZone: process.env.DB_TIMEZONE ?? 'Europe/Paris' }),
        })
    }

    /*
    |--------------------------------------------------------------------------
    | Controller routes, built from controllers/
    |--------------------------------------------------------------------------
    */
    @All('*path')
    async handle(@Req() req: Request, @Res() res: Response) {
        const path = req.path.replace(/\/+$/, '') || '/'
        const { route, args, pathExists } = RouteDiscovery.match(routes, req.method, path)

        if (!route) {
            return pathExists
                ? ResponseHelper.error(res, 'Method not allowed', 405, 'METHOD_NOT_ALLOWED')
                : ResponseHelper.error(res, 'Route not found', 404, 'NOT_FOUND', { path })
        }
        return route.handler(req, res, args)
    }
}
