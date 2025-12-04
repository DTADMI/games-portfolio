/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prefer standalone in Docker runtime; launcher falls back to `next start` if needed
  output: process.env.NEXT_STANDALONE === "true" ? "standalone" : undefined,
  reactStrictMode: true,

  // Ensure monorepo local packages transpile correctly
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

  images: {
    domains: ["images.unsplash.com", "via.placeholder.com"],
    remotePatterns: [{ protocol: "https", hostname: "*" }],
  },

  experimental: {
    externalDir: true,
  },

  env: {
    // Default for local dev; CI/CD provides the Cloud Run backend URL
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  },

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

module.exports = nextConfig;
