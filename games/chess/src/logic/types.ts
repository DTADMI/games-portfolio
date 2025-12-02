export type Color = "w" | "b";
export type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
export type Piece = `${Color}${PieceType}`;

export type Pos = { r: number; c: number };

export type Square = {
  piece: Piece | null;
};

export type Board = Square[][]; // 8x8

export type GameState = {
  board: Board;
  turn: Color;
  canCastle: {
    w: { king: boolean; queen: boolean };
    b: { king: boolean; queen: boolean };
  };
  enPassant: Pos | null; // target square behind the pawn that just double-stepped
  halfmoveClock: number; // for 50-move rule (not enforced here yet)
  fullmoveNumber: number;
};

export type Move = {
  from: Pos;
  to: Pos;
  promotion?: PieceType; // for pawn promotion
  enPassant?: boolean;
  castling?: "K" | "Q"; // king or queen side
  capture?: boolean;
};

export const SIZE = 8;
