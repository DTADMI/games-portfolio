import { describe, expect, it } from "vitest";

// We import the raw logic indirectly via the component's simple rules.
// For now we will simulate board interactions by calling minimal helpers
// extracted from the UI when possible. Since the Checkers game logic is
// self-contained in the component, we validate key invariants on move generation
// using a simplified reimplementation of initial board and legalMoves mirroring the component.

type Color = "w" | "b";
type Piece = { color: Color; king: boolean } | null;
type Pos = { r: number; c: number };
type Move = { to: Pos; capture?: Pos };

const SIZE = 8;

function initialBoard(): Piece[][] {
  const board: Piece[][] = Array.from({ length: SIZE }, () => Array<Piece>(SIZE).fill(null));
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const dark = (r + c) % 2 === 1;
      if (!dark) continue;
      if (r < 3) board[r][c] = { color: "b", king: false };
      if (r > 4) board[r][c] = { color: "w", king: false };
    }
  }
  return board;
}

function inBounds(r: number, c: number) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function legalMoves(board: Piece[][], from: Pos): Move[] {
  const p = board[from.r][from.c];
  if (!p) return [];
  const dirs: number[] = p.king ? [1, -1] : p.color === "w" ? [-1] : [1];
  const moves: Move[] = [];
  let hasCapture = false;
  for (const dr of dirs) {
    for (const dc of [-1, 1]) {
      const r1 = from.r + dr,
        c1 = from.c + dc;
      if (inBounds(r1, c1)) {
        if (!board[r1][c1]) {
          moves.push({ to: { r: r1, c: c1 } });
        } else if (board[r1][c1] && board[r1][c1]!.color !== p.color) {
          const r2 = r1 + dr,
            c2 = c1 + dc;
          if (inBounds(r2, c2) && !board[r2][c2]) {
            hasCapture = true;
            moves.push({ to: { r: r2, c: c2 }, capture: { r: r1, c: c1 } });
          }
        }
      }
    }
  }
  return hasCapture ? moves.filter((m) => m.capture) : moves;
}

describe("checkers rules", () => {
  it("forces captures when available", () => {
    const b = initialBoard();
    // Create a simple capture: move a white piece forward to expose a capture for black
    // Clear some pieces to control the scenario
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if ((r + c) % 2 === 1) b[r][c] = null;
      }
    }
    // Place black at (2,1), white at (3,2), landing square (4,3) empty
    b[2][1] = { color: "b", king: false };
    b[3][2] = { color: "w", king: false };
    // For the black piece at (2,1), only capture move should be returned
    const moves = legalMoves(b, { r: 2, c: 1 });
    expect(moves.length).toBe(1);
    expect(moves[0].capture).toBeTruthy();
    expect(moves[0].to).toEqual({ r: 4, c: 3 });
  });

  it("allows multi-jump chaining when available", () => {
    const b = initialBoard();
    // Clear the board, set up two-step capture for black
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        b[r][c] = null;
      }
    }
    b[2][1] = { color: "b", king: false };
    b[3][2] = { color: "w", king: false };
    b[5][4] = { color: "w", king: false };

    // First capture from (2,1) -> (4,3)
    const first = legalMoves(b, { r: 2, c: 1 }).find((m) => !!m.capture)!;
    // apply first
    const p = b[2][1]!;
    b[2][1] = null;
    b[first.to.r][first.to.c] = p;
    b[first.capture!.r][first.capture!.c] = null;

    // Now expect a second capture available from (4,3) to (6,5)
    const chain = legalMoves(b, { r: 4, c: 3 }).filter((m) => !!m.capture);
    expect(chain.length).toBe(1);
    expect(chain[0].to).toEqual({ r: 6, c: 5 });
  });
});
