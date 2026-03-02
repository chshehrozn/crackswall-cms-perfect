/** @type {import('next').NextConfig} */
import WebpackObfuscator from 'webpack-obfuscator';

const nextConfig = {
    turbopack: {},
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'media.imgcdn.org' },
            { protocol: 'https', hostname: 'crackswall.zeezsoft.com' },
            { protocol: 'http', hostname: '127.0.0.1' },
            { protocol: 'https', hostname: '**' }, // allow server image URLs set in config
        ],
    },
    async headers() {
        // Standard strict security headers
        const securityHeaders = [
            { key: 'X-DNS-Prefetch-Control', value: 'on' },
            { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
            { key: 'X-XSS-Protection', value: '1; mode=block' },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ];

        return [
            {
                // Apply these headers to all routes
                source: '/(.*)',
                headers: securityHeaders,
            },
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "http://localhost:3001" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    },
    webpack: (config, { dev, isServer }) => {
        // Enforce extreme security on server-side transpiled code in production
        if (!dev && isServer) {
            config.plugins.push(
                new WebpackObfuscator({
                    compact: true,
                    controlFlowFlattening: true,
                    controlFlowFlatteningThreshold: 0.75,
                    deadCodeInjection: true,
                    deadCodeInjectionThreshold: 0.4,
                    debugProtection: true,
                    debugProtectionInterval: 4000,
                    disableConsoleOutput: true,
                    splitStrings: true,
                    stringArray: true,
                    stringArrayEncoding: ['base64'],
                }, [])
            );
        }
        return config;
    }
};

export default nextConfig;
