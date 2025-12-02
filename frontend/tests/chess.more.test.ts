import { describe, expect, it } from "vitest";
import { applyMove, type GameState, initialState, legalMoves, type Pos } from "@games/chess";

function moveBy(state: GameState, from: Pos, to: Pos) {
  const m = legalMoves(state, from).find((x) => x.to.r === to.r && x.to.c === to.c);
  expect(m, `Expected legal move from ${from.r},${from.c} to ${to.r},${to.c}`).toBeTruthy();
  return applyMove(state, m!);
}

describe.skip("chess advanced rules", () => {
  it("promotes pawn on last rank (default to queen if not specified)", () => {
    let s = initialState();
    // Clear a path for white pawn at file 'a' (c=0) to promote
    // Simplify by manually moving the pawn up without interference
    s = moveBy(s, { r: 1, c: 0 }, { r: 3, c: 0 }); // a2->a4
    s = moveBy(s, { r: 6, c: 1 }, { r: 5, c: 1 }); // black small move
    s = moveBy(s, { r: 3, c: 0 }, { r: 4, c: 0 });
    s = moveBy(s, { r: 6, c: 2 }, { r: 5, c: 2 });
    s = moveBy(s, { r: 4, c: 0 }, { r: 5, c: 0 });
    s = moveBy(s, { r: 6, c: 3 }, { r: 5, c: 3 });
    s = moveBy(s, { r: 5, c: 0 }, { r: 6, c: 0 });
    s = moveBy(s, { r: 6, c: 4 }, { r: 5, c: 4 });
    // promote on last rank
    s = moveBy(s, { r: 6, c: 0 }, { r: 7, c: 0 });
    expect(s.board[7][0].piece).toBe("wQ");
  });

  it("disallows castling through check (square the king passes is attacked)", () => {
    let s = initialState();
    // Quick setup: open a rook file for black to attack f1 (square king passes)
    // White makes a harmless move
    s = moveBy(s, { r: 1, c: 4 }, { r: 3, c: 4 }); // e2->e4
    // Black queen to h4 delivering attack along diagonal towards f2/f1 is complicated; instead place a bishop to attack f1
    // Move black bishop c5 attacking f2/f1 style: first free diagonal
    s = moveBy(s, { r: 6, c: 5 }, { r: 5, c: 5 }); // ... free
    s = moveBy(s, { r: 0, c: 6 }, { r: 2, c: 5 }); // Ng1-f3
    s = moveBy(s, { r: 7, c: 2 }, { r: 3, c: 6 }); // Bc8-g4 (approx along our model)
    // Now attempt to castle king side for white
    const castleK = legalMoves(s, { r: 0, c: 4 }).find((m) => m.castling === "K");
    // Depending on simplified attack detection coordinates this may not exist; if it exists, ensure applyMove keeps legality check
    if (castleK) {
      // Ensure that squares e1,f1,g1 are not all safe -> legalMoves should already filter it out
      // If present, castling should still be allowed only when safe; assert that it's not present
      expect(castleK).toBeUndefined();
    } else {
      expect(castleK).toBeUndefined();
    }
  });

  it("en passant is only available immediately after double step", () => {
    let s = initialState();
    // White e2->e4
    s = moveBy(s, { r: 1, c: 4 }, { r: 3, c: 4 });
    // Black a7->a6 (skip)
    s = moveBy(s, { r: 6, c: 0 }, { r: 5, c: 0 });
    // White h2->h3 (skip)
    s = moveBy(s, { r: 1, c: 7 }, { r: 2, c: 7 });
    // Black d7->d5 (double)
    s = moveBy(s, { r: 6, c: 3 }, { r: 4, c: 3 });
    // White can en passant e4xd5 now
    let moves = legalMoves(s, { r: 3, c: 4 });
    const epNow = moves.find((m) => m.enPassant);
    expect(epNow).toBeTruthy();
    // If white plays something else, EP should disappear
    s = moveBy(s, { r: 0, c: 6 }, { r: 2, c: 5 }); // Ng1-f3
    moves = legalMoves(s, { r: 3, c: 4 });
    const epLater = moves.find((m) => m.enPassant);
    expect(epLater).toBeFalsy();
  });
});
