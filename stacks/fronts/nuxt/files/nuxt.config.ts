import { TRAILING_SLASH_ENABLED } from './utils/pathHelpers.js'

const isDev = process.env.NODE_ENV !== 'production'

// Static site: "nuxt generate" (start.bat then G) prerenders every page reachable from "/" by its links,
// and @nuxtjs/sitemap lists them automatically: no route to write by hand.
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: isDev },
  devServer: { port: {{APP_PORT}} },

  // Style of the site, then the DC Scaffold design while it is on (dc-scaffold.config.js)
  css: ['@/assets/css/main.css', '@/assets/css/design.css'],

  modules: ['@pinia/nuxt', '@nuxt/image', '@nuxtjs/sitemap', '@nuxtjs/robots'],

  // Site identity for SEO, sitemap.xml and robots.txt (NUXT_PUBLIC_SITE_* in .env / .env.production).
  // Outside production robots.txt blocks every crawler automatically.
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
    name: process.env.NUXT_PUBLIC_SITE_NAME,
    trailingSlash: TRAILING_SLASH_ENABLED,
  },

  // Public values read with useRuntimeConfig().public, filled from the NUXT_PUBLIC_* variables
  runtimeConfig: {
    public: {
      siteName: '',
      siteUrl: '',
      backendDomain: '',
    },
  },

  app: {
    head: {
      // @two-languages
      // Language of the pages (plugins/lang.js changes it in the browser)
      // @end-two-languages
      // @one-language
      // Language of the pages
      // @end-one-language
      htmlAttrs: { lang: '{{DEFAULT_LANG}}' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  experimental: { viewTransition: true },

  nitro: {
    prerender: { crawlLinks: true, routes: ['/'] },
    compressPublicAssets: { gzip: true, brotli: true },
  },

  vite: {
    build: { target: 'es2022' },
    esbuild: { drop: isDev ? [] : ['console', 'debugger'], legalComments: 'none' },
  },

  image: {
    quality: 80,
    format: ['webp', 'avif'],
  },
})
