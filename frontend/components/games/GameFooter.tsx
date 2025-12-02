// frontend/components/games/GameFooter.tsx
"use client";

import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function GameFooter() {
  const { game, stats, saveProgress } = useGame();
  const router = useRouter();

  if (!game) {
    return null;
  }

  const handleSaveAndQuit = async () => {
    try {
      await saveProgress();
      router.push("/games");
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {game.title} • {stats?.totalPlays || 0} plays
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Restart
            </Button>

            <Button variant="outline" size="sm" onClick={handleSaveAndQuit}>
              Save & Quit
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
