// frontend/contexts/GameContext.tsx
"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Game, getGameById } from "@/lib/games";
import { useAuth } from "./AuthContext";
import { useSound } from "@games/shared";
import { GameStats, getGameProgress, saveGameProgress } from "@/lib/gameProgress";

interface GameContextType {
  game: Game | null;
  stats: GameStats | null;
  updateStats: (updates: Partial<GameStats>) => void;
  saveProgress: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children, gameId }: { children: React.ReactNode; gameId: string }) {
  const [game, setGame] = useState<Game | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { user } = useAuth();
  const { playSound } = useSound();
  const router = useRouter();

  // Load game data and progress
  useEffect(() => {
    const loadGame = async () => {
      try {
        setIsLoading(true);

        // Load game data
        const gameData = getGameById(gameId);
        if (!gameData) {
          throw new Error(`Game with ID ${gameId} not found`);
        }
        setGame(gameData);

        // Load game progress if user is authenticated
        if (user) {
          try {
            const progress = await getGameProgress(user.uid, gameId);
            if (progress) {
              setStats(progress);
            } else {
              // Initialize new game stats
              setStats({
                highScore: 0,
                totalPlays: 0,
                achievements: [],
                lastPlayed: new Date().toISOString(),
              });
            }
          } catch (err) {
            console.error("Failed to load game progress:", err);
            // Continue with default stats
            setStats({
              highScore: 0,
              totalPlays: 0,
              achievements: [],
              lastPlayed: new Date().toISOString(),
            });
          }
        } else {
          // Guest user - initialize with default stats
          setStats({
            highScore: 0,
            totalPlays: 0,
            achievements: [],
            lastPlayed: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error loading game:", err);
        setError(err instanceof Error ? err : new Error("Failed to load game"));
        // Redirect to games list if game not found
        if (err instanceof Error && err.message.includes("not found")) {
          router.push("/games");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();
  }, [gameId, user, router]);

  // Update game stats
  const updateStats = (updates: Partial<GameStats>) => {
    setStats((prev) => {
      if (!prev) {
        return null;
      }

      const newStats = {
        ...prev,
        ...updates,
        lastPlayed: new Date().toISOString(),
      };

      // Play sound for high score
      if (updates.highScore !== undefined && updates.highScore > (prev.highScore || 0)) {
        playSound("achievement");
      }

      return newStats;
    });
  };

  // Save game progress
  const saveProgress = useCallback(async () => {
    if (!user || !stats) {
      return;
    }

    try {
      await saveGameProgress(user.uid, gameId, stats);
    } catch (err) {
      console.error("Failed to save game progress:", err);
      throw err;
    }
  }, [user, stats, gameId]);

  // Save progress when component unmounts or stats change
  useEffect(() => {
    return () => {
      if (user && stats) {
        saveProgress().catch(console.error);
      }
    };
  }, [user, stats, saveProgress]);

  const value = {
    game,
    stats,
    updateStats,
    saveProgress,
    isLoading,
    error,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
