<!-- Section of the project README: [fr] / [en] lines are kept for that language only -->
```
backend/
[fr] ├── config/database.php       getDbConnection() (mysqli ou PDO, null sans base)
[en] ├── config/database.php       getDbConnection() (mysqli or PDO, null without database)
[fr] ├── public/index.php          middlewares + routes automatiques
[en] ├── public/index.php          middlewares + automatic routes
└── src/
[fr]     ├── Controllers/          Controller.php (base) + tes contrôleurs
[en]     ├── Controllers/          Controller.php (base) + your controllers
[fr]     ├── Core/                 attribut Route + RouteDiscovery
[en]     ├── Core/                 Route attribute + RouteDiscovery
[fr]     ├── Helper/               ResponseHelper, RequestHelper, DatabaseHelper (mysqli ou PDO), ErrorHandler
[en]     ├── Helper/               ResponseHelper, RequestHelper, DatabaseHelper (mysqli or PDO), ErrorHandler
    └── Middleware/           SessionMiddleware, CorsMiddleware
```

`backend/src/Controllers/ProductsController.php`

```php
<?php

namespace App\Controllers;

use App\Core\Route;
use App\Helper\RequestHelper;
use App\Helper\ResponseHelper;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ProductsController extends Controller
{
    public function getAll(Request $request, Response $response): Response
    {
        return ResponseHelper::success($response, ['products' => $this->fetchAll('SELECT * FROM products')]);
    }

    public function getOne(Request $request, Response $response, array $args): Response
    {
        $product = $this->fetchOne('SELECT * FROM products WHERE id = ?', [(int) $args['id']]);
        return $product
            ? ResponseHelper::success($response, ['product' => $product])
            : ResponseHelper::notFound($response, 'Product not found');
    }

    public function create(Request $request, Response $response): Response
    {
        $data = $this->body($request);
        if ($missing = RequestHelper::missing($data, ['name', 'price'])) {
            return ResponseHelper::validationError($response, 'Missing fields: ' . implode(', ', $missing));
        }

        $id = $this->insert('INSERT INTO products (name, price) VALUES (?, ?)', [$data['name'], (float) $data['price']]);
        return ResponseHelper::success($response, ['id' => $id], 201);
    }

    #[Route('POST', '/{id}/mark-shipped')]
    public function markShipped(Request $request, Response $response, array $args): Response
    {
        $this->execute('UPDATE products SET shipped = 1 WHERE id = ?', [(int) $args['id']]);
        return ResponseHelper::success($response);
    }
}
```
