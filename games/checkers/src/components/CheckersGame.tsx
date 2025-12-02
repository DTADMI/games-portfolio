// games/checkers/src/components/CheckersGame.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { soundManager } from "@games/shared";

type Color = "w" | "b";
type Piece = { color: Color; king: boolean } | null;

const SIZE = 8;

function initialBoard(): Piece[][] {
  const board: Piece[][] = Array.from({ length: SIZE }, () => Array<Piece>(SIZE).fill(null));
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const dark = (r + c) % 2 === 1;
      if (!dark) {continue;}
      if (r < 3) {board[r][c] = { color: "b", king: false };}
      if (r > 4) {board[r][c] = { color: "w", king: false };}
    }
  }
  return board;
}

function inBounds(r: number, c: number) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

type Pos = { r: number; c: number };

type Move = { to: Pos; capture?: Pos };

function legalMoves(board: Piece[][], from: Pos): Move[] {
  const p = board[from.r][from.c];
  if (!p) {return [];}
  const dirs: number[] = p.king ? [1, -1] : p.color === "w" ? [-1] : [1];
  const moves: Move[] = [];
  let hasCapture = false;
  for (const dr of dirs) {
    for (const dc of [-1, 1]) {
      const r1 = from.r + dr,
        c1 = from.c + dc;
      if (inBounds(r1, c1)) {
        if (!board[r1][c1]) {
          // simple move
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
  // if any capture exists, only return captures (common checkers rule)
  return hasCapture ? moves.filter((m) => m.capture) : moves;
}

export const CheckersGame: React.FC = () => {
  const [board, setBoard] = useState<Piece[][]>(() => initialBoard());
  const [turn, setTurn] = useState<Color>("w");
  const [selected, setSelected] = useState<Pos | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [mustContinue, setMustContinue] = useState<Pos | null>(null); // multi-jump
  const [winner, setWinner] = useState<Color | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void soundManager.preloadSound("move", "/sounds/click.mp3");
    void soundManager.preloadSound("capture", "/sounds/brick-break.mp3");
    void soundManager.preloadSound("invalid", "/sounds/wall.mp3");
    void soundManager.preloadSound("king", "/sounds/level-complete.mp3");
  }, []);

  const onSquareClick = useCallback(
    (r: number, c: number) => {
      const p = board[r][c];

      // try completing a move
      if (selected) {
        const mv = moves.find((m) => m.to.r === r && m.to.c === c);
        if (mv) {
          const newBoard = board.map((row) => row.map((q) => (q ? { ...q } : null)));
          const src = newBoard[selected.r][selected.c]!;
          newBoard[selected.r][selected.c] = null;
          newBoard[r][c] = src;
          // capture
          if (mv.capture) {
            newBoard[mv.capture.r][mv.capture.c] = null;
          }
          // kinging
          if ((src.color === "w" && r === 0) || (src.color === "b" && r === SIZE - 1)) {
            if (!src.king) {
              newBoard[r][c] = { ...src, king: true };
              soundManager.playSound("king", 0.9);
            }
          }

          setBoard(newBoard);

          // multi-jump
          if (mv.capture) {
            const further = legalMoves(newBoard, { r, c }).filter((m) => m.capture);
            if (further.length) {
              setSelected({ r, c });
              setMoves(further);
              setMustContinue({ r, c });
              soundManager.playSound("move", 0.4);
              return;
            }
          }

          setSelected(null);
          setMoves([]);
          setMustContinue(null);
          setTurn((t) => (t === "w" ? "b" : "w"));
          soundManager.playSound(mv.capture ? "capture" : "move", mv.capture ? 0.8 : 0.5);
          return;
        }
        // invalid target
        setSelected(null);
        setMoves([]);
        soundManager.playSound("invalid", 0.5);
        if (liveRef.current) {
          liveRef.current.textContent = "Illegal selection";
        }
        return;
      }

      // selection phase
      if (p && p.color === turn) {
        // if forced multi-jump, only that piece may move
        if (mustContinue && (mustContinue.r !== r || mustContinue.c !== c)) {
          soundManager.playSound("invalid", 0.5);
          return;
        }
        const lm = legalMoves(board, { r, c });
        if (lm.length) {
          setSelected({ r, c });
          setMoves(lm);
        } else {
          soundManager.playSound("invalid", 0.5);
          if (liveRef.current) {liveRef.current.textContent = "No legal moves for selected piece";}
        }
      }
    },
    [board, moves, selected, turn, mustContinue],
  );

  const focusSquare = (r: number, c: number) => {
    const el = boardRef.current?.querySelector<HTMLButtonElement>(
      `button[data-r="${r}"][data-c="${c}"]`,
    );
    el?.focus();
  };

  const onSquareKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const r = Number(e.currentTarget.getAttribute("data-r"));
    const c = Number(e.currentTarget.getAttribute("data-c"));
    if (Number.isNaN(r) || Number.isNaN(c)) {return;}
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        onSquareClick(r, c);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusSquare(Math.max(0, r - 1), c);
        break;
      case "ArrowDown":
        e.preventDefault();
        focusSquare(Math.min(SIZE - 1, r + 1), c);
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusSquare(r, Math.max(0, c - 1));
        break;
      case "ArrowRight":
        e.preventDefault();
        focusSquare(r, Math.min(SIZE - 1, c + 1));
        break;
    }
  };

  const uiBoard = useMemo(() => board, [board]);

  // Compute if current player has any legal move; if not, other player wins
  useEffect(() => {
    // delay until after state updates
    const color = turn;
    let any = false;
    outer: for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const p = board[r][c];
        if (p && p.color === color) {
          if (legalMoves(board, { r, c }).length) {
            any = true;
            break outer;
          }
        }
      }
    }
    if (!any) {
      setWinner(color === "w" ? "b" : "w");
      soundManager.playSound("gameOver", 0.9);
    } else {
      setWinner(null);
    }
  }, [board, turn]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={liveRef} className="sr-only" aria-live="polite">
        {winner
          ? `${winner === "w" ? "White" : "Black"} wins`
          : `Turn: ${turn === "w" ? "White" : "Black"}`}
      </div>
      <div className="text-lg font-semibold">
        Checkers — Turn: {turn === "w" ? "White" : "Black"}
      </div>
      <div ref={boardRef} className="grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 3rem)` }}>
        {uiBoard.map((row, r) =>
          row.map((sq, c) => {
            const dark = (r + c) % 2 === 1;
            const isSel = selected && selected.r === r && selected.c === c;
            const isMove = moves.some((m) => m.to.r === r && m.to.c === c);
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => onSquareClick(r, c)}
                onKeyDown={onSquareKeyDown}
                data-r={r}
                data-c={c}
                className={`w-12 h-12 flex items-center justify-center border text-sm select-none ${
                  dark ? "bg-stone-700 text-white" : "bg-stone-300 text-stone-900"
                } ${isSel ? "outline outline-2 outline-yellow-400" : ""}`}
                aria-label={`Square ${r},${c}`}
                disabled={!dark}
                style={{ cursor: dark ? "pointer" : "default" }}
                tabIndex={dark ? 0 : -1}
              >
                {sq ? (
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      sq.color === "w" ? "bg-red-400" : "bg-black"
                    } ${sq.king ? "ring-2 ring-yellow-400" : ""}`}
                    aria-label={`${sq.color === "w" ? "White" : "Black"} ${sq.king ? "king" : "man"}`}
                  />
                ) : isMove ? (
                  <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
                ) : null}
              </button>
            );
          }),
        )}
      </div>
      {winner ? (
        <div className="text-sm text-emerald-300">
          Game over — {winner === "w" ? "White" : "Black"} wins.
        </div>
      ) : (
        <div className="text-xs opacity-70">
          Basic American checkers rules (captures forced, simple multi-jumps).
        </div>
      )}
    </div>
  );
};
