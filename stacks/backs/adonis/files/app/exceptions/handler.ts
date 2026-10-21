import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { ResponseHelper } from '#helpers/response_helper'

// Turns every uncaught error into the shared JSON format
export default class HttpExceptionHandler extends ExceptionHandler {
    async handle(error: any, ctx: HttpContext) {
        const status = Number(error?.status) || 500
        const { response, request } = ctx

        if (error?.code === 'E_VALIDATION_ERROR') {
            return ResponseHelper.error(response, error.messages?.[0]?.message ?? 'Invalid data', 422, 'VALIDATION_ERROR', { errors: error.messages })
        }
        if (status === 401) return ResponseHelper.authError(response)
        if (status === 404) return ResponseHelper.error(response, 'Route not found', 404, 'NOT_FOUND', { path: request.url() })
        if (status < 500) return ResponseHelper.error(response, error?.message ?? 'Error', status, 'HTTP_ERROR')

        // Real message in development only, never leak internals in production
        return ResponseHelper.serverError(response, app.inProduction ? 'Internal server error' : error?.message)
    }

    // Logs the error (console, or an error monitoring service)
    async report(error: unknown, ctx: HttpContext) {
        return super.report(error, ctx)
    }
}
