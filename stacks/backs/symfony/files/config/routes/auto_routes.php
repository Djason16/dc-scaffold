<?php

use App\Core\RouteDiscovery;
use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;

// Controller routes, built from src/Controller (see App\Core\RouteDiscovery)
return function (RoutingConfigurator $routes): void {
    foreach (RouteDiscovery::scan(__DIR__ . '/../../src/Controller', 'App\\Controller') as $route) {
        $name = strtolower((new ReflectionClass($route['controller']))->getShortName() . '_' . $route['action']);

        $routes->add($name, $route['path'])
            ->controller([$route['controller'], $route['action']])
            ->methods($route['methods']);
    }
};
