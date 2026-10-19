import type { H3Event } from 'h3'

/**
 * Every JSON response of the API goes through this object.
 *
 * Success: { "success": true, ...data }
 * Error:   { "success": false, "error": "message", "type": "VALIDATION_ERROR" }
 */
export const ResponseHelper = {
    respond(event: H3Event, data: Record<string, unknown>, statusCode = 200) {
        setResponseStatus(event, statusCode)
        return data
    },

    success(event: H3Event, data: Record<string, unknown> = {}, statusCode = 200) {
        return ResponseHelper.respond(event, { success: true, ...data }, statusCode)
    },

    error(event: H3Event, message: string, statusCode = 400, type = 'ERROR', extra: Record<string, unknown> = {}) {
        return ResponseHelper.respond(event, { success: false, error: message, type, ...extra }, statusCode)
    },

    validationError: (event: H3Event, message: string) => ResponseHelper.error(event, message, 400, 'VALIDATION_ERROR'),
    authError: (event: H3Event, message = 'Not authenticated') => ResponseHelper.error(event, message, 401, 'AUTH_ERROR'),
    forbidden: (event: H3Event, message = 'Access denied') => ResponseHelper.error(event, message, 403, 'FORBIDDEN'),
    notFound: (event: H3Event, message = 'Resource not found') => ResponseHelper.error(event, message, 404, 'NOT_FOUND'),
    serverError: (event: H3Event, message = 'Internal server error') => ResponseHelper.error(event, message, 500, 'SERVER_ERROR'),
}
