"use client";

import dynamic from "next/dynamic";

const BubblePopGame = dynamic(() => import("@games/bubble-pop").then((m) => m.BubblePopGame), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function BubblePopPage() {
  return <BubblePopGame />;
}
