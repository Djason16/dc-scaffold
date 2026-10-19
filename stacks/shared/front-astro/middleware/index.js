// Guards run before every page, in order (the role of Nuxt's middleware/ folder). On a static site they run at build time.
// A guard receives the URL and returns nothing to continue, or a path to redirect:
//   const legacy = (url) => (url.pathname === '/old-page/' ? '/new-page/' : undefined)
const guards = []

export const onRequest = (context, next) => {
    for (const guard of guards) {
        const target = guard(context.url)
        if (target) return context.redirect(target)
    }
    return next()
}
