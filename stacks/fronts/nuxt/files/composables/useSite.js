// Site name and URL (NUXT_PUBLIC_SITE_NAME / NUXT_PUBLIC_SITE_URL)
export const useSite = () => {
    const { siteName, siteUrl } = useRuntimeConfig().public
    return { name: siteName, url: siteUrl }
}
