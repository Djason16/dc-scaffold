<!-- Section of the project README: [fr] / [en] lines are kept for that language only -->
[fr] Structure officielle de Laravel, avec les mêmes helpers et conventions que les autres back ends :
[en] Official Laravel structure, with the same helpers and conventions as the other back ends:

[fr] - `app/Http/Controllers/` — `Controller.php` (base : `fetchAll`, `fetchOne`, `insert`, `execute`, `body`) + tes contrôleurs
[en] - `app/Http/Controllers/` — `Controller.php` (base: `fetchAll`, `fetchOne`, `insert`, `execute`, `body`) + your controllers
[fr] - `app/Helper/` — `ResponseHelper` (mêmes méthodes, renvoie une `JsonResponse`), `RequestHelper::missing()`
[en] - `app/Helper/` — `ResponseHelper` (same methods, returns `JsonResponse`), `RequestHelper::missing()`
[fr] - `app/Core/` — attribut `Route` + `RouteDiscovery` (utilisé dans `routes/api.php`)
[en] - `app/Core/` — `Route` attribute + `RouteDiscovery` (used in `routes/api.php`)
[fr] - `bootstrap/app.php` — pas de préfixe `/api`, sessions, toutes les erreurs au format JSON commun
[en] - `bootstrap/app.php` — no `/api` prefix, sessions, every error in the shared JSON format
[fr] - `config/cors.php` — seulement `APP_BASE_URL`, avec les cookies
[en] - `config/cors.php` — only `APP_BASE_URL`, with cookies

`backend/app/Http/Controllers/ProductsController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Core\Route;
use App\Helper\ResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        // Laravel validation also works: errors come back as VALIDATION_ERROR
        $data = $request->validate(['name' => 'required', 'price' => 'required|numeric']);

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

[fr] - Artisan : `docker compose exec backend php artisan migrate`
[en] - Artisan: `docker compose exec backend php artisan migrate`
