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

// Answer of every call: the JSON of the API, or a failure
// The fields expected from the API can be described: api.get<{ products: Product[] }>('/products')
export type ApiResult<Data extends object = Record<string, unknown>> = Partial<Data> & { success: boolean, error?: string, status?: number }
// Body of a call: an object sent as JSON, or a FormData sent as-is
export type RequestBody = object | null
export type RequestHeaders = Record<string, string>

// '/products' -> 'http://localhost:8000/products' ({{API_BASE_SOURCE}})
const buildUrl = (endpoint: string) => `${ {{API_BASE}} }${endpoint}`

// Debug logs in development only
const log = (...args: unknown[]) => {{API_IS_DEV}} && console.log('[API]', ...args)

const failure = (error: string, status = 0, data: object = {}): ApiResult => ({ ...data, success: false, error, status })

// Same rule for fetch and XHR: OK + JSON -> data, otherwise a failure
const toResult = (ok: boolean, status: number, data: unknown): ApiResult => {
    if (!data || typeof data !== 'object') return failure(`Invalid response (HTTP ${status})`, status)
    const json = data as ApiResult
    return ok ? json : failure(json.error || `HTTP ${status}`, status, json)
}

// Turns network errors (server down, CORS...) into a failure instead of an exception
const safely = async (label: string, request: () => Promise<ApiResult>): Promise<ApiResult> => {
    try {
        return await request()
    } catch (err) {
        console.error('[API]', label, err)
        return failure((err instanceof Error && err.message) || 'Unable to contact the server.')
    }
}

const readJson = async (res: Response): Promise<unknown> =>
    res.headers.get('content-type')?.includes('application/json') ? res.json() : null

// JSON bodies are stringified, FormData is sent untouched (the browser sets its boundary)
const buildOptions = (method: string, body: RequestBody, headers: RequestHeaders = {}): RequestInit => {
    const isJson = body && !(body instanceof FormData)
    return {
        method,
        credentials: 'include',
        headers: isJson ? { 'Content-Type': 'application/json', ...headers } : headers,
        body: isJson ? JSON.stringify(body) : body ?? undefined,
    }
}

// The JSON of the API is not checked when it arrives: its fields are the ones the caller describes (Data)
const typed = <Data extends object>(result: Promise<ApiResult>) => result as Promise<unknown> as Promise<ApiResult<Data>>

// Single place where requests are sent: every shortcut below calls it
export const apiRequest = <Data extends object = Record<string, unknown>>(endpoint: string, method = 'GET', body: RequestBody = null, headers: RequestHeaders = {}): Promise<ApiResult<Data>> =>
    typed<Data>(safely(`${method} ${endpoint}`, async () => {
        log(method, endpoint, body instanceof FormData ? '[FormData]' : body ?? '')
        const res = await fetch(buildUrl(endpoint), buildOptions(method, body, headers))
        return toResult(res.ok, res.status, await readJson(res))
    }))

// POST with upload progress (fetch cannot report it, so XHR is used here)
const upload = <Data extends object = Record<string, unknown>>(endpoint: string, formData: FormData, onProgress?: (percent: number) => void, headers: RequestHeaders = {}): Promise<ApiResult<Data>> =>
    typed<Data>(new Promise((resolve) => {
        log('UPLOAD', endpoint)
        const xhr = new XMLHttpRequest()
        xhr.open('POST', buildUrl(endpoint))
        xhr.withCredentials = true
        Object.entries(headers).forEach(([name, value]) => xhr.setRequestHeader(name, value))

        xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100))
        xhr.onload = () => {
            let data: unknown = null
            try { data = JSON.parse(xhr.responseText) } catch { /* not JSON */ }
            resolve(toResult(xhr.status >= 200 && xhr.status < 300, xhr.status, data))
        }
        xhr.onerror = () => resolve(failure('Network error'))
        xhr.send(formData)
    }))

// Downloads a file (CSV, PDF...) and opens the browser "save" dialog
const download = (endpoint: string, filename: string, headers: RequestHeaders = {}): Promise<ApiResult> =>
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
    get: <Data extends object = Record<string, unknown>>(endpoint: string, headers?: RequestHeaders) => apiRequest<Data>(endpoint, 'GET', null, headers),
    post: <Data extends object = Record<string, unknown>>(endpoint: string, body?: RequestBody, headers?: RequestHeaders) => apiRequest<Data>(endpoint, 'POST', body, headers),
    put: <Data extends object = Record<string, unknown>>(endpoint: string, body?: RequestBody, headers?: RequestHeaders) => apiRequest<Data>(endpoint, 'PUT', body, headers),
    patch: <Data extends object = Record<string, unknown>>(endpoint: string, body?: RequestBody, headers?: RequestHeaders) => apiRequest<Data>(endpoint, 'PATCH', body, headers),
    delete: <Data extends object = Record<string, unknown>>(endpoint: string, headers?: RequestHeaders) => apiRequest<Data>(endpoint, 'DELETE', null, headers),
    upload,
    download,
}
