// Route guards run before every navigation, in order (the role of Nuxt's middleware/ folder).
// A guard returns nothing to continue, false to cancel, or a path to redirect:
//   const auth = (to) => (to.path.startsWith('/admin') && !isLoggedIn() ? '/login' : undefined)
//   export default [auth]
/** @type {Function[]} */
export default []
