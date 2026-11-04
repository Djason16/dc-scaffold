<?php

/*
 * Loads the settings of the API (public/index.php): .env, or .env.production when there is no .env
 * (only .env.production is sent online). APP_ENV comes from that file: nothing to set on the server.
 * When the server itself sets APP_ENV=production, .env.production is read even if a .env was sent by mistake.
 */
function loadEnv(): void
{
    $names = getenv('APP_ENV') === 'production' ? ['.env.production'] : ['.env', '.env.production'];
    // The first file found is read (the others are ignored)
    Dotenv\Dotenv::createImmutable(__DIR__ . '/../', $names)->load();
}
