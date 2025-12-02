export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  shape: number[][];
  color: string;
  position: Position;
}

export interface GameState {
  board: string[][];
  tetromino: Tetromino;
  nextTetromino: Tetromino;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  isPaused: boolean;
  gameStarted: boolean;
  highScore: number;
}

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const CELL_SIZE = 30;
export const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "cyan",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "blue",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "orange",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "yellow",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "green",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "purple",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "red",
  },
};

export const TETROMINO_TYPES = Object.keys(TETROMINOS) as Array<keyof typeof TETROMINOS>;
