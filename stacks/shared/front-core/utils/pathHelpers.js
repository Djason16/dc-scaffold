// Every front is built with trailing slashes (/about/), the URLs below follow the same rule
export const TRAILING_SLASH_ENABLED = true

/**
 * Appends a trailing slash when enabled and missing: withTrailingSlash('/about') -> '/about/'
 * @param {string} path
 * @param {boolean} [enabled]
 * @returns {string}
 */
export const withTrailingSlash = (path, enabled = TRAILING_SLASH_ENABLED) =>
    enabled && !path.endsWith('/') ? `${path}/` : path

/**
 * Joins a base URL and a path without doubling the slash: joinUrl('https://site.com/', '/about')
 * @param {string} [base]
 * @param {string} [path]
 * @returns {string}
 */
export const joinUrl = (base = '', path = '/') => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
