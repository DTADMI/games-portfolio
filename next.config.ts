import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    images: {
        domains: ['images.unsplash.com', 'via.placeholder.com'],
    },

    webpack: (config) => {
        // Resolve aliases to enable importing game packages from the monorepo
        config.resolve.alias = {
            ...config.resolve.alias,
            '@games/shared': path.resolve(__dirname, 'libs/shared/src'),
            '@games/snake': path.resolve(__dirname, 'games/snake/src'),
            '@games/memory': path.resolve(__dirname, 'games/memory/src'),
            '@games/breakout': path.resolve(__dirname, 'games/breakout/src'),
            '@games/tetris': path.resolve(__dirname, 'games/tetris/src'),
        };
        return config;
    },

    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
        NEXT_PUBLIC_FEATURE_REALTIME: process.env.NEXT_PUBLIC_FEATURE_REALTIME || 'false',
    },
};

export default nextConfig;
