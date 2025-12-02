"use client";

import dynamic from "next/dynamic";

const TowerDefenseGame = dynamic(
  () => import("@games/tower-defense").then((m) => m.TowerDefenseGame),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    ),
  },
);

export default function TowerDefensePage() {
  return <TowerDefenseGame />;
}
