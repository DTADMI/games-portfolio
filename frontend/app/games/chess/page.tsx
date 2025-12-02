"use client";

import dynamic from "next/dynamic";

const ChessGame = dynamic(() => import("@games/chess").then((m) => m.ChessGame), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function ChessPage() {
  return <ChessGame />;
}
