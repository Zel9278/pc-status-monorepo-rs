/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    assetPrefix: process.env.NODE_ENV === 'production' ? '/pc-status-monorepo-rs' : '',
    basePath: process.env.NODE_ENV === 'production' ? '/pc-status-monorepo-rs' : '',
    async rewrites() {
        // Rewrites only work in development mode, not in static export
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
