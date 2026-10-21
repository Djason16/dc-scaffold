import type { HttpContext } from '@adonisjs/core/http'

type Response = HttpContext['response']

/**
 * Every JSON response of the API goes through this object.
 *
 * Success: { "success": true, ...data }
 * Error:   { "success": false, "error": "message", "type": "VALIDATION_ERROR" }
 */
export const ResponseHelper = {
    respond(response: Response, data: Record<string, unknown>, statusCode = 200) {
        return response.status(statusCode).json(data)
    },

    success(response: Response, data: Record<string, unknown> = {}, statusCode = 200) {
        return ResponseHelper.respond(response, { success: true, ...data }, statusCode)
    },

    error(response: Response, message: string, statusCode = 400, type = 'ERROR', extra: Record<string, unknown> = {}) {
        return ResponseHelper.respond(response, { success: false, error: message, type, ...extra }, statusCode)
    },

    validationError: (response: Response, message: string) => ResponseHelper.error(response, message, 400, 'VALIDATION_ERROR'),
    authError: (response: Response, message = 'Not authenticated') => ResponseHelper.error(response, message, 401, 'AUTH_ERROR'),
    forbidden: (response: Response, message = 'Access denied') => ResponseHelper.error(response, message, 403, 'FORBIDDEN'),
    notFound: (response: Response, message = 'Resource not found') => ResponseHelper.error(response, message, 404, 'NOT_FOUND'),
    serverError: (response: Response, message = 'Internal server error') => ResponseHelper.error(response, message, 500, 'SERVER_ERROR'),
}
