// Route guards run before every navigation, in order (the role of Nuxt's middleware/ folder).
// A guard returns nothing to continue, or a redirect:
//   import { redirect } from 'react-router'
//   const auth = ({ request }) => (new URL(request.url).pathname.startsWith('/admin') && !isLoggedIn() ? redirect('/login') : null)
//   export default [auth]
/** @type {Function[]} */
export default []
