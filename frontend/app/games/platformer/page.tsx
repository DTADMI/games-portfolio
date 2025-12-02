"use client";

import dynamic from "next/dynamic";

const PlatformerGame = dynamic(() => import("@games/platformer").then((m) => m.PlatformerGame), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function PlatformerPage() {
  return <PlatformerGame />;
}
