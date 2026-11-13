// Site name and URL (PUBLIC_SITE_NAME / PUBLIC_SITE_URL in .env and .env.production)
export const useSite = () => ({
    name: import.meta.env.PUBLIC_SITE_NAME,
    url: import.meta.env.PUBLIC_SITE_URL,
})
