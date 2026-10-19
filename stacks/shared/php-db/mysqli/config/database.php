<?php

/**
 * Opens the MySQL connection (mysqli) shared by every controller.
 * Returns null when no database is configured (DB_HOST empty in .env).
 * mysqli throws on any error, which is turned into a JSON 500.
 */
function getDbConnection(): ?mysqli
{
    if (empty($_ENV['DB_HOST'])) {
        return null;
    }

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    $mysqli = new mysqli($_ENV['DB_HOST'], $_ENV['DB_USER'], $_ENV['DB_PASS'], $_ENV['DB_NAME'], (int) ($_ENV['DB_PORT'] ?? 3306));
    $mysqli->set_charset('utf8mb4');

    // Align MySQL with the PHP timezone (current UTC offset, DST included)
    $timezone = new DateTimeZone($_ENV['DB_TIMEZONE'] ?? 'Europe/Paris');
    $offset = (new DateTimeImmutable('now', $timezone))->format('P');
    $mysqli->query("SET time_zone = '{$offset}'");

    return $mysqli;
}
