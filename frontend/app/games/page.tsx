// frontend/app/games/page.tsx
"use client";

import dynamic from "next/dynamic";

// Define the game type
type Game = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  featured?: boolean;
  comingSoon?: boolean;
};

// Define the games data
const GAMES: Game[] = [
  {
    id: "snake",
    title: "Snake Game",
    description: "Classic snake game with modern twist and smooth animations",
    image: "/images/games/snake-preview.jpg",
    tags: ["Classic", "Arcade"],
    featured: true,
  },
  {
    id: "memory",
    title: "Memory Card Game",
    description: "Test your memory with this fun card matching game",
    image: "/images/games/memory-preview.jpg",
    tags: ["Puzzle", "Memory"],
    featured: true,
  },
  {
    id: "breakout",
    title: "Breakout",
    description: "Break all the bricks with the ball and avoid missing it",
    image: "/images/games/breakout-preview.jpg",
    tags: ["Arcade", "Action"],
    featured: true,
  },
  {
    id: "tetris",
    title: "Tetris",
    description: "Classic tile-matching puzzle game",
    image: "/images/games/tetris-preview.jpg",
    tags: ["Puzzle", "Arcade"],
    comingSoon: true,
  },
  {
    id: "platformer",
    title: "Puzzle Platformer",
    description: "2D platformer with challenging puzzles",
    image: "/images/games/platformer-preview.jpg",
    tags: ["Platformer", "Puzzle", "Adventure"],
    comingSoon: true,
  },
  {
    id: "tower-defense",
    title: "Tower Defense",
    description: "Strategic tower defense game",
    image: "/images/games/tower-defense-preview.jpg",
    tags: ["Strategy", "Tactical", "Single Player"],
    comingSoon: true,
  },
];

// Dynamically import the GamesList component with SSR disabled
const GamesList = dynamic<{ games: Game[] }>(() => import("@/components/games/GamesList"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading games...</p>
      </div>
    </div>
  ),
});

// This is a client-side only page component
export default function GamesPage() {
  return <GamesList games={GAMES} />;
}
