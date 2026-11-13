// Site name and URL (VITE_SITE_NAME / VITE_SITE_URL)
export const useSite = () => ({
    name: String(import.meta.env.VITE_SITE_NAME ?? ''),
    url: String(import.meta.env.VITE_SITE_URL ?? ''),
})
