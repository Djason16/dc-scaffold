<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helper\ResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * Base class for every controller: short query helpers so each controller stays small
 * (same names as the Slim / PHP back ends).
 *
 *   class ProductsController extends Controller
 *   {
 *       public function getAll(): JsonResponse
 *       {
 *           return ResponseHelper::success(['products' => $this->fetchAll('SELECT * FROM products')]);
 *       }
 *   }
 */
abstract class Controller
{
    protected function body(Request $request): array
    {
        return $request->all();
    }

    protected function fetchAll(string $sql, array $params = []): array
    {
        return array_map(fn ($row) => (array) $row, DB::select($sql, $params));
    }

    protected function fetchOne(string $sql, array $params = []): ?array
    {
        $row = DB::selectOne($sql, $params);
        return $row === null ? null : (array) $row;
    }

    protected function insert(string $sql, array $params = []): int
    {
        DB::insert($sql, $params);
        return (int) DB::getPdo()->lastInsertId();
    }

    protected function execute(string $sql, array $params = []): int
    {
        return DB::affectingStatement($sql, $params);
    }

    // Answer of an update or a delete by id: { id } when a row changed, else 404
    protected function changed(int $changed, int|string $id, string $notFound = 'Resource not found'): JsonResponse
    {
        return $changed > 0 ? ResponseHelper::success(['id' => $id]) : ResponseHelper::notFound($notFound);
    }
}
