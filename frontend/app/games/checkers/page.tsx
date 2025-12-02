"use client";

import dynamic from "next/dynamic";

const CheckersGame = dynamic(() => import("@games/checkers").then((m) => m.CheckersGame), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function CheckersPage() {
  return <CheckersGame />;
}
