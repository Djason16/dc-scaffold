import type { Response } from 'express'

/**
 * Every JSON response of the API goes through this object.
 *
 * Success: { "success": true, ...data }
 * Error:   { "success": false, "error": "message", "type": "VALIDATION_ERROR" }
 */
export const ResponseHelper = {
    respond(res: Response, data: Record<string, unknown>, statusCode = 200) {
        return res.status(statusCode).json(data)
    },

    success(res: Response, data: Record<string, unknown> = {}, statusCode = 200) {
        return ResponseHelper.respond(res, { success: true, ...data }, statusCode)
    },

    error(res: Response, message: string, statusCode = 400, type = 'ERROR', extra: Record<string, unknown> = {}) {
        return ResponseHelper.respond(res, { success: false, error: message, type, ...extra }, statusCode)
    },

    validationError: (res: Response, message: string) => ResponseHelper.error(res, message, 400, 'VALIDATION_ERROR'),
    authError: (res: Response, message = 'Not authenticated') => ResponseHelper.error(res, message, 401, 'AUTH_ERROR'),
    forbidden: (res: Response, message = 'Access denied') => ResponseHelper.error(res, message, 403, 'FORBIDDEN'),
    notFound: (res: Response, message = 'Resource not found') => ResponseHelper.error(res, message, 404, 'NOT_FOUND'),
    serverError: (res: Response, message = 'Internal server error') => ResponseHelper.error(res, message, 500, 'SERVER_ERROR'),
    // Limit of tries reached (429): "Retry-After" tells the browser when to try again (in seconds)
    tooManyRequests(res: Response, message = 'Too many attempts', retryAfter = 0) {
        if (retryAfter) res.set('Retry-After', String(retryAfter))
        return ResponseHelper.error(res, message, 429, 'TOO_MANY_REQUESTS', retryAfter ? { retryAfter } : {})
    },
}
