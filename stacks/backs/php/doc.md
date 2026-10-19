<!-- Section of the project README: [fr] / [en] lines are kept for that language only -->
```
backend/
[fr] ├── bootstrap.php             autoload, .env, CORS, session, erreurs JSON
[en] ├── bootstrap.php             autoload, .env, CORS, session, JSON errors
[fr] ├── config/database.php       getDbConnection() (mysqli ou PDO, null sans base)
[en] ├── config/database.php       getDbConnection() (mysqli or PDO, null without database)
[fr] ├── public/index.php          routes automatiques
[en] ├── public/index.php          automatic routes
└── src/
[fr]     ├── Controllers/          Controller.php (base) + tes contrôleurs
[en]     ├── Controllers/          Controller.php (base) + your controllers
[fr]     ├── Core/                 Router, Env, attribut Route + RouteDiscovery
[en]     ├── Core/                 Router, Env, Route attribute + RouteDiscovery
[fr]     └── Helper/               ResponseHelper, RequestHelper, DatabaseHelper (mysqli ou PDO)
[en]     └── Helper/               ResponseHelper, RequestHelper, DatabaseHelper (mysqli or PDO)
```

`backend/src/Controllers/ProductsController.php`

```php
<?php

namespace App\Controllers;

use App\Core\Route;
use App\Helper\RequestHelper;
use App\Helper\ResponseHelper;

class ProductsController extends Controller
{
    public function getAll(array $args): void
    {
        ResponseHelper::success(['products' => $this->fetchAll('SELECT * FROM products')]);
    }

    public function getOne(array $args): void
    {
        $product = $this->fetchOne('SELECT * FROM products WHERE id = ?', [(int) $args['id']]);
        $product ? ResponseHelper::success(['product' => $product]) : ResponseHelper::notFound('Product not found');
    }

    public function create(array $args): void
    {
        $data = $this->body();
        if ($missing = RequestHelper::missing($data, ['name', 'price'])) {
            ResponseHelper::validationError('Missing fields: ' . implode(', ', $missing));
            return;
        }

        $id = $this->insert('INSERT INTO products (name, price) VALUES (?, ?)', [$data['name'], (float) $data['price']]);
        ResponseHelper::success(['id' => $id], 201);
    }

    #[Route('POST', '/{id}/mark-shipped')]
    public function markShipped(array $args): void
    {
        $this->execute('UPDATE products SET shipped = 1 WHERE id = ?', [(int) $args['id']]);
        ResponseHelper::success();
    }
}
```

[fr] - Pas besoin de Composer : les classes `App\` sont chargées depuis `src/`
[en] - No Composer needed: classes under `App\` are loaded from `src/`
