<!-- Section of the project README: [fr] / [en] lines are kept for that language only -->
[fr] Structure officielle de Symfony, avec les mêmes helpers et conventions que les autres back ends :
[en] Official Symfony structure, with the same helpers and conventions as the other back ends:

[fr] - `src/Controller/` — `Controller.php` (base : `fetchAll`, `fetchOne`, `insert`, `execute`, `body`) + tes contrôleurs
[en] - `src/Controller/` — `Controller.php` (base: `fetchAll`, `fetchOne`, `insert`, `execute`, `body`) + your controllers
[fr] - `src/Helper/` — `ResponseHelper` (mêmes méthodes, renvoie une `JsonResponse`), `RequestHelper`
[en] - `src/Helper/` — `ResponseHelper` (same methods, returns `JsonResponse`), `RequestHelper`
[fr] - `src/Core/` — attribut `Route` + `RouteDiscovery` (utilisé dans `config/routes/auto_routes.php`)
[en] - `src/Core/` — `Route` attribute + `RouteDiscovery` (used in `config/routes/auto_routes.php`)
[fr] - `src/EventListener/ExceptionListener.php` — toutes les erreurs au format JSON commun
[en] - `src/EventListener/ExceptionListener.php` — every error in the shared JSON format
[fr] - `config/packages/nelmio_cors.yaml` — seulement `APP_BASE_URL`, avec les cookies
[en] - `config/packages/nelmio_cors.yaml` — only `APP_BASE_URL`, with cookies

`backend/src/Controller/ProductsController.php`

```php
<?php

namespace App\Controller;

use App\Core\Route;
use App\Helper\RequestHelper;
use App\Helper\ResponseHelper;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ProductsController extends Controller
{
    public function getAll(): JsonResponse
    {
        return ResponseHelper::success(['products' => $this->fetchAll('SELECT * FROM products')]);
    }

    public function getOne(string $id): JsonResponse
    {
        $product = $this->fetchOne('SELECT * FROM products WHERE id = ?', [(int) $id]);
        return $product ? ResponseHelper::success(['product' => $product]) : ResponseHelper::notFound('Product not found');
    }

    public function create(Request $request): JsonResponse
    {
        $data = $this->body($request);
        if ($missing = RequestHelper::missing($data, ['name', 'price'])) {
            return ResponseHelper::validationError('Missing fields: ' . implode(', ', $missing));
        }

        $id = $this->insert('INSERT INTO products (name, price) VALUES (?, ?)', [$data['name'], (float) $data['price']]);
        return ResponseHelper::success(['id' => $id], 201);
    }

    #[Route('POST', '/{id}/mark-shipped')]
    public function markShipped(string $id): JsonResponse
    {
        $this->execute('UPDATE products SET shipped = 1 WHERE id = ?', [(int) $id]);
        return ResponseHelper::success();
    }
}
```

[fr] - Console : `docker compose exec backend php bin/console cache:clear`
[en] - Console: `docker compose exec backend php bin/console cache:clear`
