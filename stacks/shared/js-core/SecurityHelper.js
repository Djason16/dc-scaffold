/*
 * Security of the API, the same for every back end:
 *   SecurityHelper.headers(isHttps)                         headers to set on every answer (set by the middleware of the API)
 *   SecurityHelper.tooMany('contact', ip, 5, 600)           true after 5 tries in 10 minutes (contact form, logins...)
 *   SecurityHelper.hit(`login:${email}`, ip, 900) / clear()  counts a failed login / a good login starts again from zero
 *   SecurityHelper.ip(forwardedFor, remoteAddress)          address of the visitor: the LAST entry of X-Forwarded-For
 *   SecurityHelper.fileType(buffer)                         real type of a file sent ("image/png"...), read in its first bytes
 *   SecurityHelper.tooLong(data, { name: 100, message: 5000 }) error message when a text is too long, else null
 * The counters stay in memory: they start again from zero when the server restarts; those untouched for a day are removed.
 */

/** @type {Map<string, number[]>} */
const tries = new Map()

// Signatures of the first bytes of the files accepted (offset in the file, bytes)
const SIGNATURES = [
    { type: 'image/jpeg', offset: 0, bytes: [0xff, 0xd8, 0xff] },
    { type: 'image/png', offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] },
    { type: 'image/gif', offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
    { type: 'image/webp', offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
    { type: 'image/avif', offset: 4, bytes: [0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66] },
    { type: 'application/pdf', offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] },
]

// Counters untouched for a day are removed from time to time (1 save in 100): the memory never grows
/** @param {string} key @param {number[]} times */
const save = (key, times) => {
    tries.set(key, times)
    if (Math.random() >= 0.01) return
    const oldest = Date.now() - 86400 * 1000
    for (const [name, list] of tries) if ((list.at(-1) ?? 0) < oldest) tries.delete(name)
}

/** @param {string} key @param {string} ip @param {number} seconds */
const recent = (key, ip, seconds) => {
    const since = Date.now() - seconds * 1000
    return (tries.get(`${key}|${ip}`) ?? []).filter((time) => time > since)
}

export const SecurityHelper = {
    /** @param {boolean} isHttps @returns {Record<string, string>} */
    headers(isHttps) {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            ...(isHttps ? { 'Strict-Transport-Security': 'max-age=31536000' } : {}),
        }
    },

    /** @param {string | string[] | undefined | null} forwardedFor @param {string | undefined | null} remoteAddress */
    ip(forwardedFor, remoteAddress) {
        const list = String([forwardedFor ?? ''].flat().join(',')).split(',').map((part) => part.trim()).filter(Boolean)
        return list.at(-1) ?? remoteAddress ?? 'local'
    },

    /** @param {string} key @param {string} ip @param {number} max @param {number} seconds @param {boolean} [count] */
    tooMany(key, ip, max, seconds, count = true) {
        const times = recent(key, ip, seconds)
        if (times.length >= max) return true
        if (count) save(`${key}|${ip}`, [...times, Date.now()])
        return false
    },

    /** @param {string} key @param {string} ip @param {number} seconds */
    hit(key, ip, seconds) {
        save(`${key}|${ip}`, [...recent(key, ip, seconds), Date.now()])
    },

    /** @param {string} key @param {string} ip */
    clear(key, ip) {
        tries.delete(`${key}|${ip}`)
    },

    /** @param {Uint8Array} buffer @returns {string} "" when the type is not one of SIGNATURES */
    fileType(buffer) {
        const found = SIGNATURES.find(({ offset, bytes }) => bytes.every((byte, index) => buffer[offset + index] === byte))
        return found?.type ?? ''
    },

    /** @param {Record<string, unknown>} data @param {Record<string, number>} max @returns {string | null} */
    tooLong(data, max) {
        for (const [field, length] of Object.entries(max)) {
            const value = data?.[field]
            if (typeof value === 'string' && value.length > length) return `The ${field} is too long (${length} characters at most).`
        }
        return null
    },
}
