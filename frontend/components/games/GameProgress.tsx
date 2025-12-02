// frontend/components/games/GameProgress.tsx
"use client";

import { Progress } from "@/components/ui/progress";
import { GameStats } from "@/lib/gameProgress";

interface GameProgressProps {
  stats: GameStats;
}

export function GameProgress({ stats }: GameProgressProps) {
  // Calculate progress based on achievements or other metrics
  const progress = Math.min(100, (stats.achievements.length / 10) * 100);

  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
