// www.my-site.com -> my-site.com (301, path and parameters kept): not every host does it, the site does it itself
export default defineEventHandler((event) => {
    const host = getRequestHost(event, { xForwardedHost: true })
    if (host?.startsWith('www.')) {
        const url = getRequestURL(event, { xForwardedHost: true })
        return sendRedirect(event, `https://${host.slice(4)}${url.pathname}${url.search}`, 301)
    }
})
