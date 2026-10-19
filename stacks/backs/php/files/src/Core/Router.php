<?php

namespace App\Core;

use App\Helper\ResponseHelper;

/**
 * Tiny REST router. Controller routes are added by RouteDiscovery in public/index.php.
 *
 *   $router->map(['GET'], '/products/{id}', [$productsController, 'getOne']);
 *   // ProductsController::getOne(array $args) receives ['id' => '12']
 */
class Router
{
    private array $routes = [];

    public function get(string $path, callable $handler): void
    {
        $this->map(['GET'], $path, $handler);
    }

    public function map(array $methods, string $path, callable $handler): void
    {
        // '/products/{id}' -> '#^/products/(?P<id>[^/]+)$#'
        $pattern = preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', rtrim($path, '/') ?: '/');

        foreach ($methods as $method) {
            $this->routes[] = ['method' => $method, 'pattern' => "#^{$pattern}$#", 'handler' => $handler];
        }
    }

    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/') ?: '/';
        $pathExists = false;

        foreach ($this->routes as $route) {
            if (!preg_match($route['pattern'], $path, $matches)) {
                continue;
            }
            $pathExists = true;

            if ($route['method'] === $method) {
                ($route['handler'])(array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY));
                return;
            }
        }

        if ($pathExists) {
            ResponseHelper::error('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
        } else {
            ResponseHelper::error('Route not found', 404, 'NOT_FOUND', ['path' => $path]);
        }
    }
}
