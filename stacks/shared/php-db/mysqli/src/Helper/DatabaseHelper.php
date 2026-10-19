<?php

namespace App\Helper;

use mysqli;
use mysqli_stmt;

/**
 * Prepared statements in one line, so controllers never repeat
 * prepare / bind_param / execute / close.
 *
 * Parameter types are detected automatically (int, float, string, null, bool).
 *
 *   DatabaseHelper::fetchAll($db, 'SELECT * FROM products WHERE active = ?', [1]);
 *   DatabaseHelper::fetchOne($db, 'SELECT * FROM products WHERE id = ?', [$id]);
 *   DatabaseHelper::insert($db, 'INSERT INTO products (name) VALUES (?)', [$name]);
 *   DatabaseHelper::execute($db, 'DELETE FROM products WHERE id = ?', [$id]);
 */
class DatabaseHelper
{
    /** All matching rows (empty array when none). */
    public static function fetchAll(mysqli $db, string $sql, array $params = []): array
    {
        $stmt = self::run($db, $sql, $params);
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $rows;
    }

    /** First matching row, or null. */
    public static function fetchOne(mysqli $db, string $sql, array $params = []): ?array
    {
        $stmt = self::run($db, $sql, $params);
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $row ?: null;
    }

    /** Runs an INSERT and returns the new id. */
    public static function insert(mysqli $db, string $sql, array $params = []): int
    {
        $stmt = self::run($db, $sql, $params);
        $id = (int) $stmt->insert_id;
        $stmt->close();

        return $id;
    }

    /** Runs an UPDATE / DELETE and returns the number of affected rows. */
    public static function execute(mysqli $db, string $sql, array $params = []): int
    {
        $stmt = self::run($db, $sql, $params);
        $affected = $stmt->affected_rows;
        $stmt->close();

        return $affected;
    }

    private static function run(mysqli $db, string $sql, array $params): mysqli_stmt
    {
        $stmt = $db->prepare($sql);

        if ($params !== []) {
            $params = array_map(fn ($value) => is_bool($value) ? (int) $value : $value, array_values($params));
            $stmt->bind_param(self::types($params), ...$params);
        }

        $stmt->execute();

        return $stmt;
    }

    private static function types(array $params): string
    {
        return implode('', array_map(
            fn ($value) => match (true) {
                is_int($value) => 'i',
                is_float($value) => 'd',
                default => 's',
            },
            $params
        ));
    }
}
