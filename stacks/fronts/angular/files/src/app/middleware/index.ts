import { CanActivateFn } from '@angular/router'

// Route guards run before every navigation, in order (the role of Nuxt's middleware/ folder).
// A guard returns true to continue, or a redirect:
//   import { inject } from '@angular/core'
//   import { Router } from '@angular/router'
//   const auth: CanActivateFn = (route, state) => (state.url.startsWith('/admin') && !isLoggedIn() ? inject(Router).parseUrl('/login') : true)
//   export default [auth]
const middleware: CanActivateFn[] = []
export default middleware
