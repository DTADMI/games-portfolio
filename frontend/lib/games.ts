// frontend/lib/games.ts
export interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  featured: boolean;
  route: string;
  component: string;
  comingSoon?: boolean;
}

export function getGameById(id: string): Game | undefined {
  return GAMES.find((game) => game.id === id);
}

export const GAMES: Game[] = [
  {
    id: "snake",
    title: "Snake Game",
    description: "Classic snake game with modern twist and smooth animations",
    image: "/images/games/snake-preview.jpg",
    tags: ["Classic", "Arcade", "Single Player"],
    featured: true,
    route: "/games/snake",
    component: "SnakeGame",
  },
  {
    id: "memory",
    title: "Memory Card Game",
    description: "Test your memory with this fun card matching game",
    image: "/images/games/memory-preview.jpg",
    tags: ["Puzzle", "Memory", "Single Player"],
    featured: true,
    route: "/games/memory",
    component: "MemoryGame",
  },
  {
    id: "breakout",
    title: "Breakout",
    description: "Break all the bricks with the ball and avoid missing it",
    image: "/images/games/breakout-preview.jpg",
    tags: ["Arcade", "Action", "Single Player"],
    featured: true,
    route: "/games/breakout",
    component: "BreakoutGame",
  },
  {
    id: "tetris",
    title: "Tetris",
    description: "Classic tile-matching puzzle game",
    image: "/images/games/tetris-preview.jpg",
    tags: ["Puzzle", "Arcade", "Single Player"],
    featured: false,
    route: "/games/tetris",
    component: "TetrisGame",
    comingSoon: true,
  },
  {
    id: "platformer",
    title: "Puzzle Platformer",
    description: "2D platformer with challenging puzzles",
    image: "/images/games/platformer-preview.jpg",
    tags: ["Platformer", "Puzzle", "Adventure"],
    featured: false,
    route: "/games/platformer",
    component: "PlatformerGame",
    comingSoon: true,
  },
];
