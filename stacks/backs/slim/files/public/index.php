<?php

use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

use App\Core\RouteDiscovery;
use App\Helper\ErrorHandler;
use App\Helper\ResponseHelper;

use App\Middleware\SessionMiddleware;
use App\Middleware\CorsMiddleware;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../config/database.php';

/*
|--------------------------------------------------------------------------
| Load environment (.env locally, .env.production on the server)
|--------------------------------------------------------------------------
*/
$envFile = getenv('APP_ENV') === 'production' ? '.env.production' : '.env';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../', $envFile);
$dotenv->load();

date_default_timezone_set($_ENV['DB_TIMEZONE'] ?? 'Europe/Paris');

/*
|--------------------------------------------------------------------------
| Create app
|--------------------------------------------------------------------------
*/
$app = AppFactory::create();
$isDev = ($_ENV['APP_ENV'] ?? 'production') === 'development';

/*
|--------------------------------------------------------------------------
| Middlewares (the last one added runs first)
|--------------------------------------------------------------------------
*/
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();

$errorMiddleware = $app->addErrorMiddleware($isDev, false, false);
$errorMiddleware->setDefaultErrorHandler(new ErrorHandler($app->getResponseFactory()));

$app->add(new SessionMiddleware());
$app->add(new CorsMiddleware());

/*
|--------------------------------------------------------------------------
| Base route
|--------------------------------------------------------------------------
*/
$app->get('/', function (Request $request, Response $response) {
    return ResponseHelper::success($response, [
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
// The MySQL connection opens with the first controller route called, inside the error handling:
// the base route works without MySQL, and a MySQL error becomes a JSON 500
$controllers = [];
$connection = null;
foreach (RouteDiscovery::scan(__DIR__ . '/../src/Controllers', 'App\Controllers') as $route) {
    $app->map($route['methods'], $route['path'], function (Request $request, Response $response, array $args) use ($route, &$controllers, &$connection) {
        $connection ??= getDbConnection();
        $controller = $controllers[$route['controller']] ??= new $route['controller']($connection);
        return $controller->{$route['action']}($request, $response, $args);
    });
}

/*
|--------------------------------------------------------------------------
| Run app (unknown routes return a JSON 404 through ErrorHandler)
|--------------------------------------------------------------------------
*/
$app->run();
