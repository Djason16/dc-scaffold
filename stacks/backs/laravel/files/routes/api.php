<?php

use App\Core\RouteDiscovery;
use App\Helper\ResponseHelper;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Base route
|--------------------------------------------------------------------------
*/
Route::get('/', fn () => ResponseHelper::success([
    'message' => 'API ready',
    'name' => config('app.name'),
    'environment' => app()->environment(),
    'timezone' => config('app.timezone'),
    'current_time' => now()->format('Y-m-d H:i:s'),
]));

/*
|--------------------------------------------------------------------------
| Controller routes, built from app/Http/Controllers (see RouteDiscovery)
|--------------------------------------------------------------------------
*/
foreach (RouteDiscovery::scan(app_path('Http/Controllers'), 'App\\Http\\Controllers') as $route) {
    Route::match($route['methods'], $route['path'], [$route['controller'], $route['action']]);
}
