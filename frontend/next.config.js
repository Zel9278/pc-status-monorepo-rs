/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Only use static export in production for GitHub Pages
    ...(process.env.NODE_ENV === 'production' && {
        output: 'export',
        trailingSlash: true,
        assetPrefix: '/pc-status-monorepo-rs',
        basePath: '/pc-status-monorepo-rs',
    }),
    images: {
        unoptimized: true
    },
    // Development rewrites for local WebSocket server
    async rewrites() {
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/ws',
                    destination: 'http://localhost:3000/ws',
                },
                {
                    source: '/server',
                    destination: 'http://localhost:3000/server',
                },
            ]
        }
        return []
    },
}

module.exports = nextConfig
