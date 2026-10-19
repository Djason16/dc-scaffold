<?php

use App\Core\Env;
use App\Helper\ResponseHelper;

/*
|--------------------------------------------------------------------------
| Autoload: App\Helper\ResponseHelper -> src/Helper/ResponseHelper.php
|--------------------------------------------------------------------------
*/
spl_autoload_register(function (string $class) {
    $file = __DIR__ . '/src/' . str_replace('\\', '/', substr($class, strlen('App\\'))) . '.php';
    if (str_starts_with($class, 'App\\') && is_file($file)) {
        require $file;
    }
});

require __DIR__ . '/config/database.php';

/*
|--------------------------------------------------------------------------
| Load environment (.env locally, .env.production on the server)
|--------------------------------------------------------------------------
*/
Env::load(__DIR__ . '/' . (getenv('APP_ENV') === 'production' ? '.env.production' : '.env'));

date_default_timezone_set($_ENV['DB_TIMEZONE'] ?? 'Europe/Paris');

/*
|--------------------------------------------------------------------------
| Errors: every uncaught exception becomes a JSON 500
|--------------------------------------------------------------------------
*/
set_exception_handler(function (Throwable $exception) {
    error_log(sprintf('[%s] %s in %s:%d', get_class($exception), $exception->getMessage(), $exception->getFile(), $exception->getLine()));

    // Real message in development only, never leak internals in production
    $isDev = ($_ENV['APP_ENV'] ?? 'production') === 'development';
    ResponseHelper::serverError($isDev ? $exception->getMessage() : 'Internal server error');
});

/*
|--------------------------------------------------------------------------
| CORS (same headers as the other back ends)
|--------------------------------------------------------------------------
*/
header('Access-Control-Allow-Origin: ' . $_ENV['APP_BASE_URL']);
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept, user_id');
header('Access-Control-Allow-Credentials: true');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

// Preflight requests stop here
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/*
|--------------------------------------------------------------------------
| Session (7 days, HTTP only)
|--------------------------------------------------------------------------
*/
ini_set('session.gc_maxlifetime', 604800);
ini_set('session.cookie_lifetime', 604800);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 1 : 0);
ini_set('session.cookie_httponly', 1);
session_start();
