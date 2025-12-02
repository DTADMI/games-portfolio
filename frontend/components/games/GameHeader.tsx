// frontend/components/games/GameHeader.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { useSound } from "@games/shared";
import { Volume2, VolumeX } from "lucide-react";
import { GameProgress } from "./GameProgress";

export function GameHeader() {
  const { game, stats } = useGame();
  const { isMuted, toggleMute, volume, setVolume } = useSound();

  if (!game) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/games">
              <Button variant="ghost" className="font-bold">
                ← Back to Games
              </Button>
            </Link>
          </div>

          <div className="flex-1 px-4">
            <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white">
              {game.title}
            </h1>
            {stats && <GameProgress stats={stats} />}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
