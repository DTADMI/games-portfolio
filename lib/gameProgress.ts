// frontend/lib/gameProgress.ts
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface GameStats {
    highScore: number;
    totalPlays: number;
    achievements: string[];
    lastPlayed: string;
    // Add more stats as needed
}

export async function saveGameProgress(
    userId: string,
    gameId: string,
    stats: GameStats
): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        const gameStatsRef = doc(userRef, 'gameStats', gameId);

        await setDoc(
            gameStatsRef,
            {
                ...stats,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
    } catch (error) {
        console.error('Error saving game progress:', error);
        throw error;
    }
}

export async function getGameProgress(
    userId: string,
    gameId: string
): Promise<GameStats | null> {
    try {
        const userRef = doc(db, 'users', userId);
        const gameStatsRef = doc(userRef, 'gameStats', gameId);
        const docSnap = await getDoc(gameStatsRef);

        if (docSnap.exists()) {
            return docSnap.data() as GameStats;
        }
        return null;
    } catch (error) {
        console.error('Error getting game progress:', error);
        return null;
    }
}

export async function getLeaderboard(
    gameId: string,
    limit: number = 10
): Promise<Array<{ userId: string; username: string; score: number }>> {
    // This is a simplified example - in a real app, you'd query a dedicated leaderboard collection
    // that's updated whenever a high score is achieved
    return [];
}