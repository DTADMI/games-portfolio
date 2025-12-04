import type { NextConfig } from "next";

// Central Next.js config (single source of truth)
const nextConfig: NextConfig = {
  // Prefer standalone when building in Docker runtime
  output: process.env.NEXT_STANDALONE === "true" ? "standalone" : undefined,
  // Force absolute asset URLs so chunks load correctly on nested routes (Cloud Run)
  assetPrefix: "/",

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

  // Images: allow common sources; Cloud Run serves via HTTPS
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com"],
    remotePatterns: [{ protocol: "https", hostname: "*" }],
  },

  experimental: {
    // Allow importing files from outside the frontend/ directory using TS path aliases
    externalDir: true,
  },

  // Environment variables baked at build time (local default points at backend:3000)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  },

  // Keep API requests going to the configured backend when running in the same origin
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    return [
      {
        source: "/api/:path*",
        destination: `${target}/:path*`,
      },
    ];
  },
};

export default nextConfig;
