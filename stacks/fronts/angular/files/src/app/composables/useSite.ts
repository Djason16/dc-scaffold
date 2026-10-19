import { environment } from '../../environments/environment'

// Site name and URL (SITE_NAME / SITE_URL of .env, see scripts/env.mjs)
export const useSite = () => ({
    name: environment.siteName,
    url: environment.siteUrl,
})
