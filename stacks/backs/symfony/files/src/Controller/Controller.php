<?php

namespace App\Controller;

use App\Helper\RequestHelper;
use App\Helper\ResponseHelper;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\Service\Attribute\Required;

/**
 * Base class for every controller: holds the connection and exposes short
 * query helpers (same names as the Slim / PHP back ends).
 *
 *   class ProductsController extends Controller
 *   {
 *       public function getAll(): JsonResponse
 *       {
 *           return ResponseHelper::success(['products' => $this->fetchAll('SELECT * FROM products')]);
 *       }
 *   }
 */
abstract class Controller extends AbstractController
{
    protected Connection $connection;

    #[Required]
    public function setConnection(Connection $connection): void
    {
        $this->connection = $connection;
    }

    protected function body(Request $request): array
    {
        return RequestHelper::body($request);
    }

    protected function fetchAll(string $sql, array $params = []): array
    {
        return $this->connection->fetchAllAssociative($sql, $params);
    }

    protected function fetchOne(string $sql, array $params = []): ?array
    {
        return $this->connection->fetchAssociative($sql, $params) ?: null;
    }

    protected function insert(string $sql, array $params = []): int
    {
        $this->connection->executeStatement($sql, $params);
        return (int) $this->connection->lastInsertId();
    }

    protected function execute(string $sql, array $params = []): int
    {
        return (int) $this->connection->executeStatement($sql, $params);
    }

    // Answer of an update or a delete by id: { id } when a row changed, else 404
    protected function changed(int $changed, int|string $id, string $notFound = 'Resource not found'): JsonResponse
    {
        return $changed > 0 ? ResponseHelper::success(['id' => $id]) : ResponseHelper::notFound($notFound);
    }
}
