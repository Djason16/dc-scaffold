<?php

namespace App\Helper;

use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Every JSON response of the API goes through this class.
 *
 * Success: { "success": true, ...data }
 * Error:   { "success": false, "error": "message", "type": "VALIDATION_ERROR" }
 */
class ResponseHelper
{
    public static function respond(array $data, int $statusCode = 200): JsonResponse
    {
        $response = new JsonResponse($data, $statusCode);
        $response->setEncodingOptions(JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        return $response;
    }

    public static function success(array $data = [], int $statusCode = 200): JsonResponse
    {
        return self::respond(['success' => true] + $data, $statusCode);
    }

    public static function error(string $message, int $statusCode = 400, string $type = 'ERROR', array $extra = []): JsonResponse
    {
        return self::respond(['success' => false, 'error' => $message, 'type' => $type] + $extra, $statusCode);
    }

    public static function validationError(string $message): JsonResponse
    {
        return self::error($message, 400, 'VALIDATION_ERROR');
    }

    public static function authError(string $message = 'Not authenticated'): JsonResponse
    {
        return self::error($message, 401, 'AUTH_ERROR');
    }

    public static function forbidden(string $message = 'Access denied'): JsonResponse
    {
        return self::error($message, 403, 'FORBIDDEN');
    }

    public static function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return self::error($message, 404, 'NOT_FOUND');
    }

    public static function serverError(string $message = 'Internal server error'): JsonResponse
    {
        return self::error($message, 500, 'SERVER_ERROR');
    }

    // Limit of tries reached (429): "Retry-After" tells the browser when to try again (in seconds)
    public static function tooManyRequests(string $message = 'Too many attempts', int $retryAfter = 0): JsonResponse
    {
        $response = self::error($message, 429, 'TOO_MANY_REQUESTS', $retryAfter > 0 ? ['retryAfter' => $retryAfter] : []);
        if ($retryAfter > 0) {
            $response->headers->set('Retry-After', (string) $retryAfter);
        }
        return $response;
    }
}
