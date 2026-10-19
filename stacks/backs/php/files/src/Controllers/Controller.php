<?php

namespace App\Controllers;

use App\Helper\DatabaseHelper;
use App\Helper\RequestHelper;
use mysqli;
use PDO;
use RuntimeException;

/**
 * Base class for every controller: holds the connection and
 * exposes short helpers so each controller stays small.
 *
 *   class ProductController extends Controller
 *   {
 *       public function getAll(array $args): void
 *       {
 *           ResponseHelper::success(['products' => $this->fetchAll('SELECT * FROM products')]);
 *       }
 *   }
 */
abstract class Controller
{
    // mysqli or PDO depending on the project, null when it has no database
    public function __construct(protected mysqli|PDO|null $connection)
    {
    }

    protected function body(): array
    {
        return RequestHelper::body();
    }

    protected function fetchAll(string $sql, array $params = []): array
    {
        return DatabaseHelper::fetchAll($this->db(), $sql, $params);
    }

    protected function fetchOne(string $sql, array $params = []): ?array
    {
        return DatabaseHelper::fetchOne($this->db(), $sql, $params);
    }

    protected function insert(string $sql, array $params = []): int
    {
        return DatabaseHelper::insert($this->db(), $sql, $params);
    }

    protected function execute(string $sql, array $params = []): int
    {
        return DatabaseHelper::execute($this->db(), $sql, $params);
    }

    private function db(): mysqli|PDO
    {
        return $this->connection ?? throw new RuntimeException('No database configured: set DB_HOST in backend/.env');
    }
}
