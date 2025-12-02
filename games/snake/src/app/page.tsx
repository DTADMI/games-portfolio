// games/snake/src/app/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { soundManager } from "@games/shared";

// Dynamically import the game component with SSR disabled
const SnakeGame = dynamic(() => import("@/components/SnakeGame").then((mod) => mod.SnakeGame), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function SnakeGamePage() {
  useEffect(() => {
    // Preload sounds in the background
    const preloadSounds = async () => {
      try {
        await Promise.all([
          soundManager.preloadSound("eat", "/sounds/eat.mp3"),
          soundManager.preloadSound("gameOver", "/sounds/game-over.mp3"),
          soundManager.preloadSound("background", "/sounds/snake-bg.mp3", true),
        ]);
      } catch (error) {
        console.warn("Error preloading sounds:", error);
      }
    };

    preloadSounds();

    return () => {
      soundManager.stopMusic();
    };
  }, []);

  return <SnakeGame />;
}
