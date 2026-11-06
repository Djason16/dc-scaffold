<?php

namespace App\Helper;

/**
 * Limits how many times the same visitor does an action: contact form, failed logins, forgotten password.
 * Each counter is a small file in backend/var/rate-limit/ (no table): the times of the last tries.
 * The visitor is its address: the LAST entry of X-Forwarded-For (the one written by the server's proxy), else REMOTE_ADDR.
 *
 *   if (RateLimitHelper::tooMany('contact', 5, 600)) return 429      5 tries every 10 minutes, this one counted
 *   if (RateLimitHelper::tooMany("login:$email", 10, 900, false)) ...  only checks
 *   RateLimitHelper::hit("login:$email", 900)                          counts a failed login
 *   RateLimitHelper::clear("login:$email")                             a good login starts again from zero
 */
class RateLimitHelper
{
    /** True when the visitor already did $key $max times in the last $seconds; the try is counted unless $count is false. */
    public static function tooMany(string $key, int $max, int $seconds, bool $count = true): bool
    {
        $times = self::recent($key, $seconds);
        if (count($times) >= $max) {
            return true;
        }
        if ($count) {
            self::save($key, [...$times, time()]);
        }

        return false;
    }

    public static function hit(string $key, int $seconds): void
    {
        self::save($key, [...self::recent($key, $seconds), time()]);
    }

    public static function clear(string $key): void
    {
        @unlink(self::file($key));
    }

    /** Address of the visitor (last X-Forwarded-For entry: the earlier ones are written by the visitor and can be faked). */
    public static function ip(): string
    {
        $forwarded = array_filter(array_map('trim', explode(',', (string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ''))));
        return $forwarded ? end($forwarded) : (string) ($_SERVER['REMOTE_ADDR'] ?? 'cli');
    }

    private static function recent(string $key, int $seconds): array
    {
        $file = self::file($key);
        $times = is_file($file) ? json_decode((string) @file_get_contents($file), true) : [];
        $since = time() - $seconds;

        return array_values(array_filter(is_array($times) ? $times : [], fn ($time) => is_int($time) && $time > $since));
    }

    private static function save(string $key, array $times): void
    {
        @file_put_contents(self::file($key), json_encode($times), LOCK_EX);
    }

    // One file per action and visitor; the address is hashed (nothing personal written in clear)
    private static function file(string $key): string
    {
        $directory = dirname(__DIR__, 2) . '/var/rate-limit';
        if (!is_dir($directory)) {
            @mkdir($directory, 0755, true);
        }

        return $directory . '/' . hash('sha256', $key . '|' . self::ip()) . '.json';
    }
}
