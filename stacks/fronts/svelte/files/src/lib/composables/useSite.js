// Site name and URL (VITE_SITE_NAME / VITE_SITE_URL in .env and .env.production)
export const useSite = () => ({
    name: import.meta.env.VITE_SITE_NAME,
    url: import.meta.env.VITE_SITE_URL,
})
