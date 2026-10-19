<?php

namespace App\Core;

/**
 * Minimal .env reader: KEY=value lines, # comments, optional quotes.
 */
class Env
{
    public static function load(string $path): void
    {
        if (!is_file($path)) {
            throw new \RuntimeException("Missing environment file: {$path}");
        }

        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = array_map('trim', explode('=', $line, 2));
            $_ENV[$key] = trim($value, '"\'');
        }
    }
}
