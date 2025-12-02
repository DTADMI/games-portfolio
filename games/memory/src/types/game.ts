export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
  gameOver: boolean;
  score: number;
  highScore: number;
  gameStarted: boolean;
}

export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const GAME_SPEED = 100; // ms

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const;
