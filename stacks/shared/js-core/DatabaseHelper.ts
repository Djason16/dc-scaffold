import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { SQLInputValue } from 'node:sqlite'

/*
 * Two drivers behind the same four methods, chosen by DB_CONNECTION in backend/.env:
 *   mysql  -> MySQL / MariaDB through mysql2 (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS)
 *   sqlite -> a local file through node:sqlite, built into Node.js (DB_FILE), no server needed
 * The SQL stays the same for simple queries: "?" placeholders work with both.
 */

// Values of the "?" of a query (what MySQL and SQLite both take), and a row of a result (its columns)
export type Param = string | number | bigint | boolean | Date | Buffer | Uint8Array | null
type Params = Param[]
export type Row = Record<string, unknown>
type Driver = {
    all: (sql: string, params: Params) => Promise<Row[]>
    run: (sql: string, params: Params) => Promise<{ id: number, changes: number }>
}

let driver: Promise<Driver> | null = null

const mysqlDriver = async (): Promise<Driver> => {
    const mysql = (await import('mysql2/promise')).default
    if (!process.env.DB_HOST) throw new Error('MySQL is not configured: set DB_HOST in backend/.env')
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        charset: 'utf8mb4',
        dateStrings: true,
    })
    return {
        all: async (sql, params) => {
            const [rows] = await pool.execute(sql, params)
            return rows as Row[]
        },
        run: async (sql, params) => {
            const [result] = await pool.execute(sql, params) as [import('mysql2').ResultSetHeader, unknown]
            return { id: result.insertId, changes: result.affectedRows }
        },
    }
}

// SQLite only takes numbers, texts, bigints, bytes and null: true / false become 1 / 0, a date its ISO text
const toSqlite = (params: Params): SQLInputValue[] =>
    params.map((value) => (typeof value === 'boolean' ? Number(value) : value instanceof Date ? value.toISOString() : value))

const sqliteDriver = async (): Promise<Driver> => {
    const { DatabaseSync } = await import('node:sqlite')
    // turbopackIgnore: a file chosen when the server runs, not a part of the build (Next.js)
    const file = resolve(/* turbopackIgnore: true */ process.env.DB_FILE || 'database/database.sqlite')
    mkdirSync(dirname(file), { recursive: true })
    const db = new DatabaseSync(file)
    db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;')
    return {
        // node:sqlite answers at once: its result given as a promise, like MySQL
        all: (sql, params) => Promise.resolve(db.prepare(sql).all(...toSqlite(params))),
        run: (sql, params) => {
            const result = db.prepare(sql).run(...toSqlite(params))
            return Promise.resolve({ id: Number(result.lastInsertRowid), changes: Number(result.changes) })
        },
    }
}

// Opened on first use, then shared by every request
const getDriver = () => {
    const sqlite = (process.env.DB_CONNECTION || 'mysql').toLowerCase() === 'sqlite'
    // A failed connection is not kept: the next request tries again
    driver ??= (sqlite ? sqliteDriver() : mysqlDriver()).catch((error) => {
        driver = null
        throw error
    })
    return driver
}

/**
 * Prepared statements in one line (same names as the PHP back ends).
 *
 *   await DatabaseHelper.fetchAll('SELECT * FROM products WHERE active = ?', [1])
 *   await DatabaseHelper.fetchOne('SELECT * FROM products WHERE id = ?', [id])
 *   await DatabaseHelper.insert('INSERT INTO products (name) VALUES (?)', [name])
 *   await DatabaseHelper.execute('DELETE FROM products WHERE id = ?', [id])
 */
// Arrow functions: a controller can take them as they are (fetchAll = DatabaseHelper.fetchAll), "this" is never used
export const DatabaseHelper = {
    /** All matching rows (empty array when none). */
    fetchAll: async (sql: string, params: Params = []): Promise<Row[]> => (await getDriver()).all(sql, params),

    /** First matching row, or null. */
    fetchOne: async (sql: string, params: Params = []): Promise<Row | null> => {
        const rows = await DatabaseHelper.fetchAll(sql, params)
        return rows[0] ?? null
    },

    /** Runs an INSERT and returns the new id. */
    insert: async (sql: string, params: Params = []): Promise<number> => (await (await getDriver()).run(sql, params)).id,

    /** Runs an UPDATE / DELETE and returns the number of affected rows. */
    execute: async (sql: string, params: Params = []): Promise<number> => (await (await getDriver()).run(sql, params)).changes,
}