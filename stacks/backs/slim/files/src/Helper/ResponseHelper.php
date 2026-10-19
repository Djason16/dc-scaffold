<?php

namespace App\Helper;

use Psr\Http\Message\ResponseInterface as Response;

/**
 * Every JSON response of the API goes through this class.
 *
 * Success: { "success": true, ...data }
 * Error:   { "success": false, "error": "message", "type": "VALIDATION_ERROR" }
 */
class ResponseHelper
{
    public static function respond(Response $response, array $data, int $statusCode = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
    }

    public static function success(Response $response, array $data = [], int $statusCode = 200): Response
    {
        return self::respond($response, ['success' => true] + $data, $statusCode);
    }

    public static function error(Response $response, string $message, int $statusCode = 400, string $type = 'ERROR', array $extra = []): Response
    {
        return self::respond($response, ['success' => false, 'error' => $message, 'type' => $type] + $extra, $statusCode);
    }

    public static function validationError(Response $response, string $message): Response
    {
        return self::error($response, $message, 400, 'VALIDATION_ERROR');
    }

    public static function authError(Response $response, string $message = 'Not authenticated'): Response
    {
        return self::error($response, $message, 401, 'AUTH_ERROR');
    }

    public static function forbidden(Response $response, string $message = 'Access denied'): Response
    {
        return self::error($response, $message, 403, 'FORBIDDEN');
    }

    public static function notFound(Response $response, string $message = 'Resource not found'): Response
    {
        return self::error($response, $message, 404, 'NOT_FOUND');
    }

    public static function serverError(Response $response, string $message = 'Internal server error'): Response
    {
        return self::error($response, $message, 500, 'SERVER_ERROR');
    }
}
