<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface;

class SessionMiddleware
{
    public function __invoke(Request $request, RequestHandlerInterface $handler): Response
    {
        $this->configureSession();

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        return $handler->handle($request);
    }

    private function configureSession(): void
    {
        ini_set('session.gc_maxlifetime', 604800);
        ini_set('session.cookie_lifetime', 604800);
        ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 1 : 0);
        ini_set('session.cookie_httponly', 1);
    }
}
