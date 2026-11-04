<?php

use App\Core\Env;

/*
 * Loads the settings of the API (bootstrap.php): .env, or .env.production when there is no .env
 * (only .env.production is sent online). APP_ENV comes from that file: nothing to set on the server.
 * When the server itself sets APP_ENV=production, .env.production is read even if a .env was sent by mistake.
 */
function loadEnv(): void
{
    $names = getenv('APP_ENV') === 'production' ? ['.env.production'] : ['.env', '.env.production'];
    // The first file found is read (the others are ignored)
    foreach ($names as $name) {
        if (is_file(__DIR__ . '/../' . $name)) {
            Env::load(__DIR__ . '/../' . $name);
            return;
        }
    }
    throw new RuntimeException('Missing environment file: .env or .env.production');
}
