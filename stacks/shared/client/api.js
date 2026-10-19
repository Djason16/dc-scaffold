/**
 * Client for the project API.
 * {{API_USAGE}}
 *
 *   await api.get('/products')
 *   await api.post('/products', { name: 'Shirt' })      // JSON body
 *   await api.post('/media', formData)                  // FormData sent as-is
 *   await api.put('/products/1', data)
 *   await api.patch('/products/1', data)
 *   await api.delete('/products/1')
 *   await api.upload('/media', formData, (percent) => {})
 *   await api.download('/products/export', 'products.csv')
 *
 * Every call resolves (never throws) to:
 *   success -> the JSON returned by the API, e.g. { success: true, products: [...] }
 *   failure -> { success: false, error: 'message', status: 404, ...API fields }
 */
{{API_IMPORTS}}

/**
 * @typedef {{ success: boolean, error?: string, status?: number, [key: string]: any }} ApiResult
 * @typedef {Record<string, string>} RequestHeaders
 */

// '/products' -> 'http://localhost:8000/products' ({{API_BASE_SOURCE}})
/** @param {string} endpoint */
const buildUrl = (endpoint) => `${ {{API_BASE}} }${endpoint}`

// Debug logs in development only
/** @param {...any} args */
const log = (...args) => {{API_IS_DEV}} && console.log('[API]', ...args)

/**
 * @param {string} error
 * @param {number} [status]
 * @param {object} [data]
 * @returns {ApiResult}
 */
const failure = (error, status = 0, data = {}) => ({ ...data, success: false, error, status })

// Same rule for fetch and XHR: OK + JSON -> data, otherwise a failure
/**
 * @param {boolean} ok
 * @param {number} status
 * @param {any} data
 * @returns {ApiResult}
 */
const toResult = (ok, status, data) => {
    if (!data) return failure(`Invalid response (HTTP ${status})`, status)
    return ok ? data : failure(data.error || `HTTP ${status}`, status, data)
}

// Turns network errors (server down, CORS...) into a failure instead of an exception
/**
 * @param {string} label
 * @param {() => Promise<ApiResult>} request
 * @returns {Promise<ApiResult>}
 */
const safely = async (label, request) => {
    try {
        return await request()
    } catch (err) {
        console.error('[API]', label, err)
        return failure((err instanceof Error && err.message) || 'Unable to contact the server.')
    }
}

/** @param {Response} res */
const readJson = async (res) =>
    res.headers.get('content-type')?.includes('application/json') ? res.json() : null

// JSON bodies are stringified, FormData is sent untouched (the browser sets its boundary)
/**
 * @param {string} method
 * @param {any} body
 * @param {RequestHeaders} [headers]
 * @returns {RequestInit}
 */
const buildOptions = (method, body, headers = {}) => {
    const isJson = body && !(body instanceof FormData)
    return {
        method,
        credentials: 'include',
        headers: isJson ? { 'Content-Type': 'application/json', ...headers } : headers,
        body: isJson ? JSON.stringify(body) : body ?? undefined,
    }
}

// Single place where requests are sent: every shortcut below calls it
/**
 * @param {string} endpoint
 * @param {string} [method]
 * @param {any} [body]
 * @param {RequestHeaders} [headers]
 * @returns {Promise<ApiResult>}
 */
export const apiRequest = (endpoint, method = 'GET', body = null, headers = {}) =>
    safely(`${method} ${endpoint}`, async () => {
        log(method, endpoint, body instanceof FormData ? '[FormData]' : body ?? '')
        const res = await fetch(buildUrl(endpoint), buildOptions(method, body, headers))
        return toResult(res.ok, res.status, await readJson(res))
    })

// POST with upload progress (fetch cannot report it, so XHR is used here)
/**
 * @param {string} endpoint
 * @param {FormData} formData
 * @param {(percent: number) => void} [onProgress]
 * @param {RequestHeaders} [headers]
 * @returns {Promise<ApiResult>}
 */
const upload = (endpoint, formData, onProgress = () => {}, headers = {}) =>
    new Promise((resolve) => {
        log('UPLOAD', endpoint)
        const xhr = new XMLHttpRequest()
        xhr.open('POST', buildUrl(endpoint))
        xhr.withCredentials = true
        Object.entries(headers).forEach(([name, value]) => xhr.setRequestHeader(name, value))

        xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100))
        xhr.onload = () => {
            let data = null
            try { data = JSON.parse(xhr.responseText) } catch { /* not JSON */ }
            resolve(toResult(xhr.status >= 200 && xhr.status < 300, xhr.status, data))
        }
        xhr.onerror = () => resolve(failure('Network error'))
        xhr.send(formData)
    })

// Downloads a file (CSV, PDF...) and opens the browser "save" dialog
/**
 * @param {string} endpoint
 * @param {string} filename
 * @param {RequestHeaders} [headers]
 * @returns {Promise<ApiResult>}
 */
const download = (endpoint, filename, headers = {}) =>
    safely(`DOWNLOAD ${endpoint}`, async () => {
        log('DOWNLOAD', endpoint, filename)
        const res = await fetch(buildUrl(endpoint), buildOptions('GET', null, headers))
        if (!res.ok) return toResult(false, res.status, await readJson(res))

        const link = document.createElement('a')
        link.href = URL.createObjectURL(await res.blob())
        link.download = filename
        link.click()
        URL.revokeObjectURL(link.href)

        return { success: true }
    })

export const api = {
    /** @type {(endpoint: string, headers?: RequestHeaders) => Promise<ApiResult>} */
    get: (endpoint, headers) => apiRequest(endpoint, 'GET', null, headers),
    /** @type {(endpoint: string, body?: any, headers?: RequestHeaders) => Promise<ApiResult>} */
    post: (endpoint, body, headers) => apiRequest(endpoint, 'POST', body, headers),
    /** @type {(endpoint: string, body?: any, headers?: RequestHeaders) => Promise<ApiResult>} */
    put: (endpoint, body, headers) => apiRequest(endpoint, 'PUT', body, headers),
    /** @type {(endpoint: string, body?: any, headers?: RequestHeaders) => Promise<ApiResult>} */
    patch: (endpoint, body, headers) => apiRequest(endpoint, 'PATCH', body, headers),
    /** @type {(endpoint: string, headers?: RequestHeaders) => Promise<ApiResult>} */
    delete: (endpoint, headers) => apiRequest(endpoint, 'DELETE', null, headers),
    upload,
    download,
}
