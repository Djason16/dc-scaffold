<?php

namespace App\EventListener;

use App\Helper\ResponseHelper;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Turns every uncaught error into the shared JSON format.
 */
#[AsEventListener]
class ExceptionListener
{
    public function __construct(#[Autowire('%kernel.debug%')] private bool $debug)
    {
    }

    public function __invoke(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();

        $response = match (true) {
            $exception instanceof NotFoundHttpException => ResponseHelper::error('Route not found', 404, 'NOT_FOUND', [
                'path' => $event->getRequest()->getPathInfo(),
            ]),
            $exception instanceof MethodNotAllowedHttpException => ResponseHelper::error('Method not allowed', 405, 'METHOD_NOT_ALLOWED'),
            $exception instanceof HttpExceptionInterface => ResponseHelper::error($exception->getMessage() ?: 'HTTP error', $exception->getStatusCode(), 'HTTP_ERROR'),
            // Real message in development only, never leak internals in production
            default => ResponseHelper::serverError($this->debug ? $exception->getMessage() : 'Internal server error'),
        };

        $event->setResponse($response);
    }
}
