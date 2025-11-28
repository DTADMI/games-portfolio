import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Enable React Strict Mode
    reactStrictMode: true,

    // Enable SWC minification
    swcMinify: true,

    // Configure images
    images: {
        domains: ['images.unsplash.com', 'via.placeholder.com'],
    },

    // Webpack configuration for monorepo
    webpack: (config, { isServer }) => {
        // Add support for importing from shared packages
        if (!isServer) {
            config.resolve.alias['@games/shared'] = require.resolve('@games/shared');
        }

        return config;
    },

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    },
};

export default nextConfig;
