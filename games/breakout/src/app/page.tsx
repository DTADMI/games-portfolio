// games/breakout/src/app/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { soundManager } from "@games/shared";

// Dynamically import the game component with SSR disabled
const BreakoutGame = dynamic(
  () => import("@/components/BreakoutGame").then((mod) => mod.BreakoutGame),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    ),
  },
);

export default function BreakoutGamePage() {
  useEffect(() => {
    // Preload sounds in the background
    const preloadSounds = async () => {
      try {
        await Promise.all([
          soundManager.preloadSound("paddle", "/sounds/paddle.mp3"),
          soundManager.preloadSound("brickHit", "/sounds/brick-hit.mp3"),
          soundManager.preloadSound("brickBreak", "/sounds/brick-break.mp3"),
          soundManager.preloadSound("wall", "/sounds/wall.mp3"),
          soundManager.preloadSound("loseLife", "/sounds/lose-life.mp3"),
          soundManager.preloadSound("gameOver", "/sounds/game-over.mp3"),
          soundManager.preloadSound("levelComplete", "/sounds/level-complete.mp3"),
          soundManager.preloadSound("powerUp", "/sounds/power-up.mp3"),
          soundManager.preloadSound("background", "/sounds/breakout-bg.mp3", true),
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

  return <BreakoutGame />;
}
