import { defineEnvVars } from '@sveltejs/kit/env'

// Environment variables, read from .env (npm run dev) and .env.production (build), imported from '$app/env/public'
export const variables = defineEnvVars({
    PUBLIC_SITE_NAME: { public: true, static: true, description: 'Site name (SEO, titles)' },
    PUBLIC_SITE_URL: { public: true, static: true, description: 'Public address of the site (SEO, sitemap.xml)' },
    // Only set when the project has an API
    PUBLIC_API_URL: { public: true, static: true, schema: (value) => value ?? '', description: 'Address of the API' },
})
