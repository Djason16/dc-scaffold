/** @type {import('next').NextConfig} */
const nextConfig = {
    // Static site in out/ (like "nuxt generate"), uploaded as-is.
    // Remove these three lines to deploy a Node.js server instead.
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
    // Qualif: the site is served from a folder of its address (scripts/qualif.mjs); nothing at the root (dev, production)
    ...(process.env.QUALIF_BASE_PATH ? { basePath: process.env.QUALIF_BASE_PATH } : {}),
}

export default nextConfig
