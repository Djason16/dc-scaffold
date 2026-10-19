// Local Docker API while developing, real domain once deployed
export const IS_DEV = ['localhost', '127.0.0.1'].includes(location.hostname)

export const API_URL = IS_DEV
    ? 'http://localhost:{{API_PORT}}'
    : 'https://api.example.com'
