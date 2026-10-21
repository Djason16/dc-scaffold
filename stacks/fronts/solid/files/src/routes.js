// Routes = files of src/pages (like Next.js): index.jsx -> /, about.jsx -> /about, blog/[id].jsx -> /blog/:id
const pages = import.meta.glob('./pages/**/*.jsx', { eager: true })

const toPath = (file) => file
    .replace(/^\.\/pages/, '')
    .replace(/\.jsx$/, '')
    .replace(/\/index$/, '')
    .replace(/\[\.\.\.(\w+)\]/g, '*$1')
    .replace(/\[(\w+)\]/g, ':$1') || '/'

export const routes = Object.entries(pages).map(([file, module]) => ({ path: toPath(file), component: module.default }))
