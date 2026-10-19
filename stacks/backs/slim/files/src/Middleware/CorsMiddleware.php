<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

class CorsMiddleware implements MiddlewareInterface
{
    public function process(Request $request, RequestHandler $handler): Response
    {
        // Preflight requests get an empty answer with the CORS headers
        $response = $request->getMethod() === 'OPTIONS'
            ? new \Slim\Psr7\Response()
            : $handler->handle($request);

        return $this->addCorsHeaders($response, $_ENV['APP_BASE_URL']);
    }

    private function addCorsHeaders(Response $response, string $allowedOrigin): Response
    {
        return $response
            ->withHeader('Access-Control-Allow-Origin', $allowedOrigin)
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, user_id')
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    }
}
