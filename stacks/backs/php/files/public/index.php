<?php

use App\Core\RouteDiscovery;
use App\Core\Router;
use App\Helper\ResponseHelper;

require __DIR__ . '/../bootstrap.php';

$router = new Router();

/*
|--------------------------------------------------------------------------
| Base route
|--------------------------------------------------------------------------
*/
$router->get('/', function () {
    ResponseHelper::success([
        'message' => 'API ready',
        'name' => $_ENV['APP_NAME'] ?? 'API',
        'environment' => $_ENV['APP_ENV'] ?? 'development',
        'timezone' => date_default_timezone_get(),
        'current_time' => date('Y-m-d H:i:s'),
    ]);
});

/*
|--------------------------------------------------------------------------
| Controller routes, built from src/Controllers (see RouteDiscovery)
|--------------------------------------------------------------------------
*/
// The MySQL connection opens with the first controller route called: the base route works without MySQL
$controllers = [];
$connection = null;
foreach (RouteDiscovery::scan(__DIR__ . '/../src/Controllers', 'App\Controllers') as $route) {
    $router->map($route['methods'], $route['path'], function (array $args) use ($route, &$controllers, &$connection) {
        $connection ??= getDbConnection();
        $controller = $controllers[$route['controller']] ??= new $route['controller']($connection);
        $controller->{$route['action']}($args);
    });
}

/*
|--------------------------------------------------------------------------
| Run (unknown routes return a JSON 404)
|--------------------------------------------------------------------------
*/
$router->dispatch();
