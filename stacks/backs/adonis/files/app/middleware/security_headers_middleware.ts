import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { SecurityHelper } from '#core/SecurityHelper'

// Security headers on every answer, errors included (app/core/SecurityHelper.js)
export default class SecurityHeadersMiddleware {
    async handle({ request, response }: HttpContext, next: NextFn) {
        for (const [name, value] of Object.entries(SecurityHelper.headers(request.protocol() === 'https'))) response.header(name, value)
        return next()
    }
}
