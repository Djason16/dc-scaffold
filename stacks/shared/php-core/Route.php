<?php

namespace App\Core;

use Attribute;

/**
 * Declares a route that the REST naming convention cannot guess.
 *
 * On a method: #[Route('POST', '/{id}/mark-shipped')]  -> POST /products/{id}/mark-shipped
 * On a class:  #[Route(path: '/shop')]                 -> changes the "/products" prefix
 */
#[Attribute(Attribute::TARGET_CLASS | Attribute::TARGET_METHOD)]
class Route
{
    public function __construct(
        public string $method = 'GET',
        public string $path = '',
    ) {
    }
}
