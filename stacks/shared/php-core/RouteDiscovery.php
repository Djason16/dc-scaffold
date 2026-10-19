<?php

namespace App\Core;

use ReflectionClass;
use ReflectionMethod;

/**
 * Builds the routes from the controllers, so they are never written by hand.
 *
 * ProductsController -> prefix /products (FieldActionsController -> /field-actions)
 *   getAll()   GET          /products
 *   getOne()   GET          /products/{id}
 *   create()   POST         /products
 *   update()   PUT, PATCH   /products/{id}
 *   delete()   DELETE       /products/{id}
 *
 * Any other public method becomes a route through #[Route('POST', '/{id}/mark-shipped')].
 * Methods without one of these names or the attribute stay private to the controller.
 */
class RouteDiscovery
{
    private const REST_ACTIONS = [
        'getAll' => [['GET'], ''],
        'getOne' => [['GET'], '/{id}'],
        'create' => [['POST'], ''],
        'update' => [['PUT', 'PATCH'], '/{id}'],
        'delete' => [['DELETE'], '/{id}'],
    ];

    /**
     * @return array<array{methods: string[], path: string, controller: string, action: string}>
     */
    public static function scan(string $directory, string $namespace): array
    {
        $routes = [];

        foreach (glob(rtrim($directory, '/\\') . '/*Controller.php') as $file) {
            $class = new ReflectionClass($namespace . '\\' . basename($file, '.php'));
            if ($class->isAbstract()) {
                continue;
            }

            $prefix = self::prefix($class);

            foreach ($class->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
                $route = self::route($method);
                if ($route === null || $method->getDeclaringClass()->getName() !== $class->getName()) {
                    continue;
                }

                [$httpMethods, $path] = $route;
                $routes[] = [
                    'methods' => $httpMethods,
                    'path' => ($prefix . $path) ?: '/',
                    'controller' => $class->getName(),
                    'action' => $method->getName(),
                ];
            }
        }

        // Fixed paths first, so /products/export is not caught by /products/{id}
        usort($routes, fn ($a, $b) => substr_count($a['path'], '{') <=> substr_count($b['path'], '{'));

        return $routes;
    }

    // [HTTP methods, path] for a controller method, or null when it is not a route
    private static function route(ReflectionMethod $method): ?array
    {
        $attribute = $method->getAttributes(Route::class)[0] ?? null;
        if ($attribute !== null) {
            $route = $attribute->newInstance();
            return [[strtoupper($route->method)], $route->path];
        }

        return self::REST_ACTIONS[$method->getName()] ?? null;
    }

    // #[Route(path: '/shop')] on the class, otherwise ProductsController -> /products
    private static function prefix(ReflectionClass $class): string
    {
        $attribute = $class->getAttributes(Route::class)[0] ?? null;
        if ($attribute !== null) {
            return rtrim($attribute->newInstance()->path, '/');
        }

        $name = preg_replace('/Controller$/', '', $class->getShortName());
        return '/' . strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $name));
    }
}
