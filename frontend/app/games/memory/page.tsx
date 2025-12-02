"use client";

import dynamic from "next/dynamic";

const MemoryGame = dynamic(() => import("@games/memory").then((m) => m.MemoryGame), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function MemoryGamePage() {
  return <MemoryGame />;
}
