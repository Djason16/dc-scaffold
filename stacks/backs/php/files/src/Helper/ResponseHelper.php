<?php

namespace App\Helper;

/**
 * Every JSON response of the API goes through this class.
 *
 * Success: { "success": true, ...data }
 * Error:   { "success": false, "error": "message", "type": "VALIDATION_ERROR" }
 */
class ResponseHelper
{
    public static function respond(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public static function success(array $data = [], int $statusCode = 200): void
    {
        self::respond(['success' => true] + $data, $statusCode);
    }

    public static function error(string $message, int $statusCode = 400, string $type = 'ERROR', array $extra = []): void
    {
        self::respond(['success' => false, 'error' => $message, 'type' => $type] + $extra, $statusCode);
    }

    public static function validationError(string $message): void
    {
        self::error($message, 400, 'VALIDATION_ERROR');
    }

    public static function authError(string $message = 'Not authenticated'): void
    {
        self::error($message, 401, 'AUTH_ERROR');
    }

    public static function forbidden(string $message = 'Access denied'): void
    {
        self::error($message, 403, 'FORBIDDEN');
    }

    public static function notFound(string $message = 'Resource not found'): void
    {
        self::error($message, 404, 'NOT_FOUND');
    }

    public static function serverError(string $message = 'Internal server error'): void
    {
        self::error($message, 500, 'SERVER_ERROR');
    }
}
