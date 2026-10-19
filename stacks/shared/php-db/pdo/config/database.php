<?php

/**
 * Opens the MySQL connection (PDO) shared by every controller.
 * Returns null when no database is configured (DB_HOST empty in .env).
 * PDO throws on any error, which is turned into a JSON 500.
 */
function getDbConnection(): ?PDO
{
    if (empty($_ENV['DB_HOST'])) {
        return null;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $_ENV['DB_HOST'],
        (int) ($_ENV['DB_PORT'] ?? 3306),
        $_ENV['DB_NAME']
    );

    $pdo = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    // Align MySQL with the PHP timezone (current UTC offset, DST included)
    $timezone = new DateTimeZone($_ENV['DB_TIMEZONE'] ?? 'Europe/Paris');
    $offset = (new DateTimeImmutable('now', $timezone))->format('P');
    $pdo->exec("SET time_zone = '{$offset}'");

    return $pdo;
}
