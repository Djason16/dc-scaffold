import type { Component } from 'solid-js'

// Routes = files of src/pages (like Next.js): index.tsx -> /, about.tsx -> /about, blog/[id].tsx -> /blog/:id
const pages = import.meta.glob<{ default: Component }>('./pages/**/*.{jsx,tsx}', { eager: true })

const toPath = (file: string) => file
    .replace(/^\.\/pages/, '')
    .replace(/\.[jt]sx$/, '')
    .replace(/\/index$/, '')
    .replace(/\[\.\.\.(\w+)\]/g, '*$1')
    .replace(/\[(\w+)\]/g, ':$1') || '/'

export const routes = Object.entries(pages).map(([file, module]) => ({ path: toPath(file), component: module.default }))
