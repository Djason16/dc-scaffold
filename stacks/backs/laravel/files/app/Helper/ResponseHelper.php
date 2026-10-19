<?php

namespace App\Helper;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

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
        return response()->json($data, $statusCode, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
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

    /**
     * Converts any exception into the shared error format (used in bootstrap/app.php).
     */
    public static function fromException(Throwable $exception, Request $request): JsonResponse
    {
        return match (true) {
            $exception instanceof ValidationException => self::validationError($exception->validator->errors()->first()),
            $exception instanceof AuthenticationException => self::authError(),
            $exception instanceof NotFoundHttpException && $exception->getPrevious() instanceof ModelNotFoundException => self::notFound(),
            $exception instanceof NotFoundHttpException => self::error('Route not found', 404, 'NOT_FOUND', ['path' => '/' . ltrim($request->path(), '/')]),
            $exception instanceof MethodNotAllowedHttpException => self::error('Method not allowed', 405, 'METHOD_NOT_ALLOWED'),
            $exception instanceof HttpExceptionInterface => self::error($exception->getMessage() ?: 'HTTP error', $exception->getStatusCode(), 'HTTP_ERROR'),
            // Real message in development only, never leak internals in production
            default => self::serverError(config('app.debug') ? $exception->getMessage() : 'Internal server error'),
        };
    }
}
