// Every front is built with trailing slashes (/about/), the URLs below follow the same rule
export const TRAILING_SLASH_ENABLED = true

/**
 * Appends a trailing slash when enabled and missing: withTrailingSlash('/about') -> '/about/'
 */
export const withTrailingSlash = (path: string, enabled: boolean = TRAILING_SLASH_ENABLED): string =>
    enabled && !path.endsWith('/') ? `${path}/` : path

/**
 * Joins a base URL and a path without doubling the slash: joinUrl('https://site.com/', '/about')
 */
export const joinUrl = (base: string = '', path: string = '/'): string => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
