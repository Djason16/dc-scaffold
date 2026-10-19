import { createBrowserRouter } from 'react-router'
import middleware from '@/middleware/index.js'
import App from './App.jsx'

// Routes = files of src/pages (like Next.js): index.jsx -> /, about.jsx -> /about, blog/[id].jsx -> /blog/:id
const pages = import.meta.glob('./pages/**/*.jsx', { eager: true })

const toPath = (file) => file
    .replace(/^\.\/pages/, '')
    .replace(/\.jsx$/, '')
    .replace(/\/index$/, '')
    .replace(/\[\.\.\.\w+\]/g, '*')
    .replace(/\[(\w+)\]/g, ':$1') || '/'

// Route guards of src/middleware run before every page (loader), in order
const runMiddleware = (args) => {
    for (const guard of middleware) {
        const result = guard(args)
        if (result) return result
    }
    return null
}

export const router = createBrowserRouter([{
    Component: App,
    loader: runMiddleware,
    children: Object.entries(pages).map(([file, module]) => ({ path: toPath(file), Component: module.default })),
}])
