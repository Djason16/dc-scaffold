// Security headers on every answer of the site and of the API, errors included (server/utils/SecurityHelper.ts);
// the proxy of the host says when it is HTTPS
export default defineEventHandler((event) => {
    setResponseHeaders(event, SecurityHelper.headers(getRequestProtocol(event, { xForwardedProto: true }) === 'https'))
})
