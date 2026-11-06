<?php

namespace App\Helper;

/**
 * Security headers of every answer of the API, errors included: no guessing of the file types, never shown in a frame,
 * no address of origin sent, HTTPS forced for a year (HSTS, only over HTTPS), version of PHP hidden.
 * Called first in public/index.php: the headers are there with any server (Apache, Nginx, php -S), also in .htaccess.
 *
 *   SecurityHelper::sendHeaders();
 */
class SecurityHelper
{
    public static function sendHeaders(): void
    {
        if (headers_sent()) {
            return;
        }
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('Referrer-Policy: no-referrer');
        $https = ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
        if ($https) {
            header('Strict-Transport-Security: max-age=31536000');
        }
        header_remove('X-Powered-By');
    }
}
