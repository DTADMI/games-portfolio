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

  // Images: use remotePatterns only (domains is deprecated in Next 16)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "*" },
    ],
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
      // IMPORTANT: Keep NextAuth routes on the frontend (do not proxy to backend)
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*",
      },
      {
        source: "/api/:path*",
        destination: `${target}/:path*`,
      },
    ];
  },

  // Minimal CSP headers that work well with next/font and our SSR app
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: http:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
