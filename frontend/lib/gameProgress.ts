// frontend/lib/gameProgress.ts
import { db } from "./firebase";
import { doc, Firestore, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export interface GameStats {
  highScore: number;
  totalPlays: number;
  achievements: string[];
  lastPlayed: string;
  // Add more stats as needed
}

function ensureDbInitialized(): Firestore {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }
  return db;
}

export async function saveGameProgress(
  userId: string,
  gameId: string,
  stats: GameStats,
): Promise<void> {
  try {
    const firestore = ensureDbInitialized();
    const userRef = doc(firestore, "users", userId);
    const gameStatsRef = doc(userRef, "gameStats", gameId);

    await setDoc(
      gameStatsRef,
      {
        ...stats,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Error saving game progress:", error);
    throw error;
  }
}

export async function getGameProgress(userId: string, gameId: string): Promise<GameStats | null> {
  try {
    const firestore = ensureDbInitialized();
    const userRef = doc(firestore, "users", userId);
    const gameStatsRef = doc(userRef, "gameStats", gameId);
    const gameStatsSnap = await getDoc(gameStatsRef);

    if (gameStatsSnap.exists()) {
      return gameStatsSnap.data() as GameStats;
    }
    return null;
  } catch (error) {
    console.error("Error getting game progress:", error);
    return null;
  }
}

export async function getLeaderboard(): Promise<
  Array<{ userId: string; username: string; score: number }>
> {
  // This is a simplified example - in a real app, you'd query a dedicated leaderboard collection
  // that's updated whenever a high score is achieved
  return [];
}
