"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Extremely small MVP for a 10x10 board Block Blast style game.
// Pieces are tiny presets; scoring = +10 per cleared row/col.
// This is intentionally simple to get a playable prototype on the route quickly.

type Cell = 0 | 1;

const BOARD_SIZE = 10;

type Piece = number[][]; // 1-filled matrix

const PRESET_PIECES: Piece[] = [
  [[1, 1, 1]],
  [[1], [1], [1]],
  [
    [1, 1],
    [1, 0],
  ],
  [
    [1, 1],
    [0, 1],
  ],
  [[1, 1]],
  [[1]],
];

function emptyBoard(): Cell[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 0 as Cell),
  );
}

function canPlace(board: Cell[][], piece: Piece, r: number, c: number): boolean {
  for (let pr = 0; pr < piece.length; pr++) {
    for (let pc = 0; pc < piece[0].length; pc++) {
      if (piece[pr][pc] === 1) {
        const rr = r + pr;
        const cc = c + pc;
        if (rr < 0 || cc < 0 || rr >= BOARD_SIZE || cc >= BOARD_SIZE) {
          return false;
        }
        if (board[rr][cc] === 1) {
          return false;
        }
      }
    }
  }
  return true;
}

function place(board: Cell[][], piece: Piece, r: number, c: number): Cell[][] {
  const next = board.map((row) => row.slice());
  for (let pr = 0; pr < piece.length; pr++) {
    for (let pc = 0; pc < piece[0].length; pc++) {
      if (piece[pr][pc] === 1) {
        next[r + pr][c + pc] = 1;
      }
    }
  }
  return next;
}

function clearLines(board: Cell[][]): { board: Cell[][]; cleared: number } {
  let cleared = 0;
  const next = board.map((row) => row.slice());

  // rows
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (next[r].every((v) => v === 1)) {
      cleared++;
      next[r] = Array.from({ length: BOARD_SIZE }, () => 0 as Cell);
    }
  }
  // cols
  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (next[r][c] !== 1) {
        full = false;
        break;
      }
    }
    if (full) {
      cleared++;
      for (let r = 0; r < BOARD_SIZE; r++) {
        next[r][c] = 0;
      }
    }
  }

  return { board: next, cleared };
}

function randomRack(): Piece[] {
  const pick = () => PRESET_PIECES[Math.floor(Math.random() * PRESET_PIECES.length)];
  return [pick(), pick(), pick()];
}

export default function BlockBlastPage() {
  const [board, setBoard] = useState<Cell[][]>(emptyBoard);
  const [rack, setRack] = useState<Piece[]>(() => randomRack());
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  function handlePlace(r: number, c: number) {
    if (selected === null) {
      return;
    }
    const piece = rack[selected];
    if (!piece) {
      return;
    }
    if (!canPlace(board, piece, r, c)) {
      return;
    }
    let next = place(board, piece, r, c);
    const clearedRes = clearLines(next);
    next = clearedRes.board;
    setScore((s) => s + clearedRes.cleared * 10);
    setBoard(next);

    const newRack = rack.slice();
    newRack.splice(selected, 1);
    if (newRack.length === 0) {
      setRack(randomRack());
    } else {
      setRack(newRack);
    }
    setSelected(null);
  }

  function reset() {
    setBoard(emptyBoard());
    setRack(randomRack());
    setSelected(null);
    setScore(0);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Block Blast (MVP)</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            Score: <b>{score}</b>
          </div>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        Place pieces on a 10×10 board. Clear full rows or columns for points.
      </p>

      <div className="grid grid-cols-10 gap-1 w-max">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handlePlace(r, c)}
              className={`h-7 w-7 rounded-sm ${cell ? "bg-primary" : "bg-muted hover:bg-muted/80"}`}
              aria-label={`cell ${r},${c}`}
            />
          )),
        )}
      </div>

      <div className="mt-6">
        <h2 className="font-medium mb-2">Rack</h2>
        <div className="flex gap-4">
          {rack.map((p, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`rounded border px-3 py-2 ${selected === i ? "border-primary" : "border-border"}`}
            >
              <div className="flex flex-col gap-0.5">
                {p.map((row, ri) => (
                  <div key={ri} className="flex gap-0.5">
                    {row.map((v, ci) => (
                      <div key={ci} className={`h-3 w-3 ${v ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
