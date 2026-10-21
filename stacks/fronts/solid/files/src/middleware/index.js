// Route guards run before every page, in order (the role of Nuxt's middleware/ folder), from src/App.jsx.
// A guard receives the URL and returns nothing to continue, or a path to redirect:
//   const auth = (url) => (url.pathname.startsWith('/admin') && !isLoggedIn() ? '/login' : undefined)
//   export default [auth]
/** @type {Array<(url: URL) => string | undefined>} */
export default []
