<?php

namespace App\Helper;

use PDO;
use PDOStatement;

/**
 * Prepared statements in one line (PDO), so controllers never repeat
 * prepare / execute / fetch. Same methods as the mysqli version.
 *
 *   DatabaseHelper::fetchAll($db, 'SELECT * FROM products WHERE active = ?', [1]);
 *   DatabaseHelper::fetchOne($db, 'SELECT * FROM products WHERE id = ?', [$id]);
 *   DatabaseHelper::insert($db, 'INSERT INTO products (name) VALUES (?)', [$name]);
 *   DatabaseHelper::execute($db, 'DELETE FROM products WHERE id = ?', [$id]);
 */
class DatabaseHelper
{
    /** All matching rows (empty array when none). */
    public static function fetchAll(PDO $db, string $sql, array $params = []): array
    {
        return self::run($db, $sql, $params)->fetchAll(PDO::FETCH_ASSOC);
    }

    /** First matching row, or null. */
    public static function fetchOne(PDO $db, string $sql, array $params = []): ?array
    {
        return self::run($db, $sql, $params)->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /** Runs an INSERT and returns the new id. */
    public static function insert(PDO $db, string $sql, array $params = []): int
    {
        self::run($db, $sql, $params);
        return (int) $db->lastInsertId();
    }

    /** Runs an UPDATE / DELETE and returns the number of affected rows. */
    public static function execute(PDO $db, string $sql, array $params = []): int
    {
        return self::run($db, $sql, $params)->rowCount();
    }

    private static function run(PDO $db, string $sql, array $params): PDOStatement
    {
        $stmt = $db->prepare($sql);
        $stmt->execute(array_map(fn ($value) => is_bool($value) ? (int) $value : $value, array_values($params)));

        return $stmt;
    }
}
