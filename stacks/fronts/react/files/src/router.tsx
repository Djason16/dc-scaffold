import { createBrowserRouter, type LoaderFunctionArgs } from 'react-router'
import type { ComponentType } from 'react'
import middleware from '@/middleware/index'
import App from './App'

// Routes = files of src/pages (like Next.js): index.tsx -> /, about.tsx -> /about, blog/[id].tsx -> /blog/:id
const pages = import.meta.glob<{ default: ComponentType }>('./pages/**/*.{jsx,tsx}', { eager: true })

const toPath = (file: string) => file
    .replace(/^\.\/pages/, '')
    .replace(/\.[jt]sx$/, '')
    .replace(/\/index$/, '')
    .replace(/\[\.\.\.\w+\]/g, '*')
    .replace(/\[(\w+)\]/g, ':$1') || '/'

// Route guards of src/middleware run before every page (loader), in order
const runMiddleware = (args: LoaderFunctionArgs) => {
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
}], {
    // Base of the site (vite.config.ts): "/" at the root of its address, "/my-site/" in a qualif
    basename: import.meta.env.BASE_URL,
})
