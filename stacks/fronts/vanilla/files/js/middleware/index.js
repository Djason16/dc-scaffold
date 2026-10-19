// Guards run before every page, in order (the role of Nuxt's middleware/ folder), from js/main.js.
// A guard receives the URL and returns nothing to continue, or a path to redirect:
//   const auth = (url) => (url.pathname.startsWith('/admin') && !isLoggedIn() ? '/login.html' : undefined)
//   export default [auth]
/** @type {Function[]} */
export default []
