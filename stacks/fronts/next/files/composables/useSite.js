// Site name and URL (NEXT_PUBLIC_SITE_NAME / NEXT_PUBLIC_SITE_URL)
export const useSite = () => ({
    name: process.env.NEXT_PUBLIC_SITE_NAME,
    url: process.env.NEXT_PUBLIC_SITE_URL,
})
