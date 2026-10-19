import { createRouter, createWebHistory } from 'vue-router'
import middleware from '@/middleware/index.js'

// Routes = files of src/pages (like Nuxt): index.vue -> /, about.vue -> /about, blog/[id].vue -> /blog/:id
const pages = import.meta.glob('../pages/**/*.vue')

const toPath = (file) => file
    .replace(/^\.\.\/pages/, '')
    .replace(/\.vue$/, '')
    .replace(/\/index$/, '')
    .replace(/\[\.\.\.(\w+)\]/g, ':$1(.*)*')
    .replace(/\[(\w+)\]/g, ':$1') || '/'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: Object.entries(pages).map(([file, component]) => ({ path: toPath(file), component })),
    scrollBehavior: () => ({ top: 0 }),
})

middleware.forEach((guard) => router.beforeEach(guard))

export default router
