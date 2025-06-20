/** @type {import('next').NextConfig} */

// デバッグ用ログ
console.log('Next.js Config Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    CI: process.env.CI,
    shouldExport: !!(process.env.CI || process.env.NODE_ENV === 'production')
});

const isStaticExport = !!(process.env.CI || process.env.NODE_ENV === 'production');
const isGitHubPages = process.env.CI && !process.env.CUSTOM_DOMAIN; // GitHub Pages deployment
const isCustomDomain = process.env.CUSTOM_DOMAIN; // Custom domain deployment

console.log('Deployment configuration:', {
    isStaticExport,
    isGitHubPages,
    isCustomDomain,
    CI: process.env.CI,
    CUSTOM_DOMAIN: process.env.CUSTOM_DOMAIN
});

const nextConfig = {
    reactStrictMode: true,
    // Use static export for production builds
    ...(isStaticExport && {
        output: 'export',
        trailingSlash: true,
        // GitHub Pages specific configuration (username.github.io/repo-name)
        ...(isGitHubPages && {
            assetPrefix: '/pc-status-monorepo-rs',
            basePath: '/pc-status-monorepo-rs',
        }),
        // Custom domain configuration (pc-status.net) - no prefix needed
        ...(isCustomDomain && {
            // No assetPrefix or basePath for custom domain
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
                    destination: 'http://localhost:3001/ws',
                },
                {
                    source: '/server',
                    destination: 'http://localhost:3001/server',
                },
            ]
        }
        return []
    },
}

module.exports = nextConfig
