/*
 * Route guards (the role of Nuxt's middleware/ folder).
 * A static export has no server, so guards run in the browser: call them from
 * components/layout/AppShell/AppShell.jsx with useRouter() (next/router) and redirect with router.replace().
 */

/**
 * Example: sends visitors to /login when they open an admin page without being logged in.
 * @param {string} path Current path (router.pathname)
 * @param {boolean} loggedIn Whether the visitor is logged in
 * @returns {string | null} Where to redirect, or null to stay on the page
 */
export const adminGuard = (path, loggedIn) => (path.startsWith('/admin') && !loggedIn ? '/login' : null)
