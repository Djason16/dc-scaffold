// Route guards run before every page, in order (the role of Nuxt's middleware/ folder), from src/routes/layout.tsx.
// A guard receives the URL and returns nothing to continue, or a path to redirect:
//   const auth = (url: URL) => (url.pathname.startsWith('/admin/') && !isLoggedIn() ? '/login/' : undefined)
//   const guards = [auth]
const guards: Array<(url: URL) => string | undefined> = []

export default guards
