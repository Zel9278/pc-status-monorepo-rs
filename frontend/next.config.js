/** @type {import('next').NextConfig} */

// デバッグ用ログ
console.log('Next.js Config Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    CI: process.env.CI,
    shouldExport: !!(process.env.CI || process.env.NODE_ENV === 'production')
});

const isStaticExport = !!(process.env.CI || process.env.NODE_ENV === 'production');
const isGitHubPages = process.env.CI; // GitHub Pages deployment

const nextConfig = {
    reactStrictMode: true,
    // Use static export for GitHub Pages deployment
    ...(isStaticExport && {
        output: 'export',
        trailingSlash: true,
        // Only use basePath for GitHub Pages, not local production builds
        ...(isGitHubPages && {
            assetPrefix: '/pc-status-monorepo-rs',
            basePath: '/pc-status-monorepo-rs',
        }),
    }),
    images: {
        unoptimized: true
    },
    // Development rewrites for local WebSocket server
    async rewrites() {
        if (process.env.NODE_ENV === 'development' && !process.env.CI) {
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
