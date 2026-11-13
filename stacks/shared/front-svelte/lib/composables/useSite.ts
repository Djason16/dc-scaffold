import { PUBLIC_SITE_NAME, PUBLIC_SITE_URL } from '$app/env/public'

// Site name and URL (PUBLIC_SITE_NAME / PUBLIC_SITE_URL in .env and .env.production)
export const useSite = () => ({ name: PUBLIC_SITE_NAME, url: PUBLIC_SITE_URL })
