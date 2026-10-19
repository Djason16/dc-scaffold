/**
 * Every JSON response of the API goes through this object.
 *
 * Success: { "success": true, ...data }
 * Error:   { "success": false, "error": "message", "type": "VALIDATION_ERROR" }
 */
export const ResponseHelper = {
    respond(res, data, statusCode = 200) {
        return res.status(statusCode).json(data)
    },

    success(res, data = {}, statusCode = 200) {
        return ResponseHelper.respond(res, { success: true, ...data }, statusCode)
    },

    error(res, message, statusCode = 400, type = 'ERROR', extra = {}) {
        return ResponseHelper.respond(res, { success: false, error: message, type, ...extra }, statusCode)
    },

    validationError: (res, message) => ResponseHelper.error(res, message, 400, 'VALIDATION_ERROR'),
    authError: (res, message = 'Not authenticated') => ResponseHelper.error(res, message, 401, 'AUTH_ERROR'),
    forbidden: (res, message = 'Access denied') => ResponseHelper.error(res, message, 403, 'FORBIDDEN'),
    notFound: (res, message = 'Resource not found') => ResponseHelper.error(res, message, 404, 'NOT_FOUND'),
    serverError: (res, message = 'Internal server error') => ResponseHelper.error(res, message, 500, 'SERVER_ERROR'),
}
