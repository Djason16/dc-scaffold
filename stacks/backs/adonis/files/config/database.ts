import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'
import env from '#start/env'

/*
 * Database of the API, chosen by DB_CONNECTION in backend/.env:
 *   mysql  -> MySQL / MariaDB (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE)
 *   sqlite -> a local file (database/database.sqlite), no server needed
 * Same SQL in the controllers for simple queries: "?" placeholders work with both.
 */
const migrations = { naturalSort: true, paths: ['database/migrations'] }
const schemaGeneration = { enabled: true, rulesPaths: ['./database/schema_rules.js'] }

const dbConfig = defineConfig({
    connection: env.get('DB_CONNECTION', 'sqlite'),

    connections: {
        sqlite: {
            client: 'better-sqlite3',
            connection: { filename: app.makePath('database/database.sqlite') },
            // Required by Knex for SQLite defaults
            useNullAsDefault: true,
            migrations,
            schemaGeneration,
        },

        mysql: {
            client: 'mysql2',
            connection: {
                host: env.get('DB_HOST'),
                port: env.get('DB_PORT'),
                user: env.get('DB_USER'),
                password: env.get('DB_PASSWORD'),
                database: env.get('DB_DATABASE'),
                dateStrings: true,
            },
            migrations,
            schemaGeneration,
            debug: app.inDev,
        },
    },
})

export default dbConfig
