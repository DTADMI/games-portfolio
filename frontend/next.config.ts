import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // Ensure Next transpiles our local workspace packages
  transpilePackages: [
    "@games/shared",
    "@games/chess",
    "@games/checkers",
    "@games/snake",
    "@games/memory",
    "@games/breakout",
    "@games/tetris",
    "@games/platformer",
    "@games/bubble-pop",
    "@games/knitzy",
    "@games/tower-defense",
    "@react-three/fiber",
    "@react-three/drei",
  ],

  // Configure images
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com"],
  },

  // Rely on Next.js built-in TS path aliases and transpilePackages for monorepo; no custom alias override needed

  experimental: {
    // Allow importing files from outside the frontend/ directory using TS path aliases
    externalDir: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  },
};

export default nextConfig;
