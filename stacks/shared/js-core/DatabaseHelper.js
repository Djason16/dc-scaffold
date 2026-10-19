import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

/*
 * Two drivers behind the same four methods, chosen by DB_CONNECTION in backend/.env:
 *   mysql  -> MySQL / MariaDB through mysql2 (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS)
 *   sqlite -> a local file through node:sqlite, built into Node.js (DB_FILE), no server needed
 * The SQL stays the same for simple queries: "?" placeholders work with both.
 */

let driver = null

const mysqlDriver = async () => {
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
        all: async (sql, params) => (await pool.execute(sql, params))[0],
        run: async (sql, params) => {
            const [result] = await pool.execute(sql, params)
            return { id: result.insertId, changes: result.affectedRows }
        },
    }
}

const sqliteDriver = async () => {
    const { DatabaseSync } = await import('node:sqlite')
    const file = resolve(process.env.DB_FILE || 'database/database.sqlite')
    mkdirSync(dirname(file), { recursive: true })
    const db = new DatabaseSync(file)
    db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;')
    return {
        all: async (sql, params) => db.prepare(sql).all(...params),
        run: async (sql, params) => {
            const result = db.prepare(sql).run(...params)
            return { id: Number(result.lastInsertRowid), changes: Number(result.changes) }
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
export const DatabaseHelper = {
    /** All matching rows (empty array when none). */
    async fetchAll(sql, params = []) {
        return (await getDriver()).all(sql, params)
    },

    /** First matching row, or null. */
    async fetchOne(sql, params = []) {
        const rows = await DatabaseHelper.fetchAll(sql, params)
        return rows[0] ?? null
    },

    /** Runs an INSERT and returns the new id. */
    async insert(sql, params = []) {
        return (await (await getDriver()).run(sql, params)).id
    },

    /** Runs an UPDATE / DELETE and returns the number of affected rows. */
    async execute(sql, params = []) {
        return (await (await getDriver()).run(sql, params)).changes
    },
}
