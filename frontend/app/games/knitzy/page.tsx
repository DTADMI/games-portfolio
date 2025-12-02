"use client";

import dynamic from "next/dynamic";

const KnitzyGame = dynamic(() => import("@games/knitzy").then((m) => m.KnitzyGame), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function KnitzyPage() {
  return <KnitzyGame />;
}
