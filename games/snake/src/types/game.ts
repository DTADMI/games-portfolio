// games/snake/src/types/game.ts
export type GameMode = "classic" | "obstacles" | "speed" | "portal";

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export interface GameConfig {
  mode: GameMode;
  speed: number;
  hasObstacles: boolean;
  hasPortals: boolean;
  gridSize: number;
}

export interface Position {
  x: number;
  y: number;
}
export interface Obstacle extends Position {}

export interface Portal {
  entry: Position;
  exit: Position;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  gameOver: boolean;
  score: number;
  highScore: number;
  gameStarted: boolean;
  config: GameConfig;
  obstacles: Obstacle[];
  portals: Portal[];
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
