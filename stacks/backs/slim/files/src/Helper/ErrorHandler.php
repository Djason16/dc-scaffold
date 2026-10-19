<?php

namespace App\Helper;

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Exception\HttpMethodNotAllowedException;
use Slim\Exception\HttpNotFoundException;
use Throwable;

/**
 * Turns every uncaught error into a JSON response, so controllers
 * don't need a try/catch in each method.
 */
class ErrorHandler
{
    public function __construct(private ResponseFactoryInterface $responseFactory)
    {
    }

    public function __invoke(Request $request, Throwable $exception, bool $displayErrorDetails): Response
    {
        $response = $this->responseFactory->createResponse();

        if ($exception instanceof HttpNotFoundException) {
            return ResponseHelper::error($response, 'Route not found', 404, 'NOT_FOUND', [
                'path' => $request->getUri()->getPath(),
            ]);
        }

        if ($exception instanceof HttpMethodNotAllowedException) {
            return ResponseHelper::error($response, 'Method not allowed', 405, 'METHOD_NOT_ALLOWED');
        }

        error_log(sprintf(
            '[%s] %s in %s:%d',
            get_class($exception),
            $exception->getMessage(),
            $exception->getFile(),
            $exception->getLine()
        ));

        // Real message in development only, never leak internals in production
        $message = $displayErrorDetails ? $exception->getMessage() : 'Internal server error';

        return ResponseHelper::serverError($response, $message);
    }
}
