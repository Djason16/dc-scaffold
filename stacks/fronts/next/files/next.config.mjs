/** @type {import('next').NextConfig} */
const nextConfig = {
    // Static site in out/ (like "nuxt generate"), uploaded as-is.
    // Remove these three lines to deploy a Node.js server instead.
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
    // The project folder is the root, even when a package-lock.json exists in a parent folder
    turbopack: { root: import.meta.dirname },
    // No AGENTS.md written by "next dev" (the project is created without it)
    agentRules: false,
    // No "N" badge of "next dev": with the Pages Router it can read the router too early and warn in the console (Next.js 16)
    devIndicators: false,
    // Qualif: the site is served from a folder of its address (scripts/qualif.mjs); nothing at the root (dev, production)
    ...(process.env.QUALIF_BASE_PATH ? { basePath: process.env.QUALIF_BASE_PATH } : {}),
}

export default nextConfig
