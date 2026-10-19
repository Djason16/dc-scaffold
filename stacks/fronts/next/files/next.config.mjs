/** @type {import('next').NextConfig} */
const nextConfig = {
    // Static site in out/ (like "nuxt generate"), uploaded as-is.
    // Remove these three lines to deploy a Node.js server instead.
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
}

export default nextConfig
