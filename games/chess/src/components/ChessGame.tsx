// games/chess/src/components/ChessGame.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { soundManager } from "@games/shared";
import { Board, Color, GameState, Move, Piece, PieceType, Pos, SIZE, Square } from "../logic/types";

function inBounds(r: number, c: number) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function sameColor(a: Piece | null, b: Piece | null) {
  if (!a || !b) {return false;}
  return a[0] === b[0];
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((s) => ({ piece: s.piece })));
}

function initialState(): GameState {
  const row = (p: (c: number) => Piece | null) =>
    Array.from({ length: SIZE }, (_, c) => ({ piece: p(c) }));
  const empty = () => row(() => null);
  const setup: Square[][] = [];
  setup.push(row((c) => ("wRNBQKBNR"[c] ? "w" + ("RNBQKBNR"[c] as PieceType) : null) as Piece));
  setup.push(row(() => "wP"));
  for (let i = 0; i < 4; i++) {setup.push(empty());}
  setup.push(row(() => "bP"));
  setup.push(row((c) => ("bRNBQKBNR"[c] ? "b" + ("RNBQKBNR"[c] as PieceType) : null) as Piece));
  return {
    board: setup,
    turn: "w",
    canCastle: {
      w: { king: true, queen: true },
      b: { king: true, queen: true },
    },
    enPassant: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
  };
}

function findKing(board: Board, color: Color): Pos | null {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c].piece;
      if (p === `${color}K`) {return { r, c };}
    }
  }
  return null;
}

function isSquareAttacked(board: Board, target: Pos, byColor: Color): boolean {
  const dirsBishop = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ] as const;
  const dirsRook = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;

  // Pawns
  const pawnDir = byColor === "w" ? 1 : -1;
  for (const dc of [-1, 1]) {
    const r = target.r - pawnDir;
    const c = target.c - dc;
    if (inBounds(r, c) && board[r][c].piece === `${byColor}P`) {return true;}
  }
  // Knights
  const jumps = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];
  for (const [dr, dc] of jumps) {
    const r = target.r + dr,
      c = target.c + dc;
    if (inBounds(r, c) && board[r][c].piece === `${byColor}N`) {return true;}
  }
  // Bishops/Queens diagonals
  for (const [dr, dc] of dirsBishop) {
    let r = target.r + dr,
      c = target.c + dc;
    while (inBounds(r, c)) {
      const p = board[r][c].piece;
      if (p) {
        if (p[0] === byColor && (p[1] === "B" || p[1] === "Q")) {return true;}
        break;
      }
      r += dr;
      c += dc;
    }
  }
  // Rooks/Queens straight
  for (const [dr, dc] of dirsRook) {
    let r = target.r + dr,
      c = target.c + dc;
    while (inBounds(r, c)) {
      const p = board[r][c].piece;
      if (p) {
        if (p[0] === byColor && (p[1] === "R" || p[1] === "Q")) {return true;}
        break;
      }
      r += dr;
      c += dc;
    }
  }
  // King one-step
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) {continue;}
      const r = target.r + dr,
        c = target.c + dc;
      if (inBounds(r, c) && board[r][c].piece === `${byColor}K`) {return true;}
    }
  }
  return false;
}

function generatePseudoLegalMoves(state: GameState, from: Pos): Move[] {
  const { board, turn, canCastle, enPassant } = state;
  const piece = board[from.r][from.c].piece;
  if (!piece || piece[0] !== turn) {return [];}
  const color: Color = piece[0] as Color;
  const type: PieceType = piece[1] as PieceType;
  const moves: Move[] = [];

  const pushRay = (dr: number, dc: number) => {
    let r = from.r + dr;
    let c = from.c + dc;
    while (inBounds(r, c)) {
      const target = board[r][c].piece;
      if (target) {
        if (!sameColor(piece, target)) {moves.push({ from, to: { r, c }, capture: true });}
        break;
      }
      moves.push({ from, to: { r, c } });
      r += dr;
      c += dc;
    }
  };

  switch (type) {
    case "P": {
      const dir = color === "w" ? 1 : -1;
      const startRow = color === "w" ? 1 : 6;
      const one = { r: from.r + dir, c: from.c };
      if (inBounds(one.r, one.c) && !board[one.r][one.c].piece) {
        moves.push({ from, to: one });
        const two = { r: from.r + 2 * dir, c: from.c };
        if (from.r === startRow && !board[two.r][two.c].piece) {
          moves.push({ from, to: two });
        }
      }
      for (const dc of [-1, 1]) {
        const cap = { r: from.r + dir, c: from.c + dc };
        if (inBounds(cap.r, cap.c)) {
          const target = board[cap.r][cap.c].piece;
          if (target && target[0] !== color) {moves.push({ from, to: cap, capture: true });}
        }
      }
      if (enPassant) {
        if (Math.abs(enPassant.c - from.c) === 1 && enPassant.r === from.r + dir) {
          moves.push({
            from,
            to: { r: enPassant.r, c: enPassant.c },
            enPassant: true,
            capture: true,
          });
        }
      }
      break;
    }
    case "N": {
      const ks = [
        { r: 2, c: 1 },
        { r: 2, c: -1 },
        { r: -2, c: 1 },
        { r: -2, c: -1 },
        { r: 1, c: 2 },
        { r: 1, c: -2 },
        { r: -1, c: 2 },
        { r: -1, c: -2 },
      ];
      for (const k of ks) {
        const r = from.r + k.r,
          c = from.c + k.c;
        if (!inBounds(r, c)) {continue;}
        const target = board[r][c].piece;
        if (!target || target[0] !== color) {moves.push({ from, to: { r, c }, capture: !!target });}
      }
      break;
    }
    case "B":
      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].forEach(([dr, dc]) => pushRay(dr, dc));
      break;
    case "R":
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].forEach(([dr, dc]) => pushRay(dr, dc));
      break;
    case "Q":
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].forEach(([dr, dc]) => pushRay(dr, dc));
      break;
    case "K": {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) {continue;}
          const r = from.r + dr,
            c = from.c + dc;
          if (!inBounds(r, c)) {continue;}
          const target = board[r][c].piece;
          if (!target || target[0] !== color) {moves.push({ from, to: { r, c }, capture: !!target });}
        }
      }
      const homeRow = color === "w" ? 0 : 7;
      if (from.r === homeRow && from.c === 4) {
        if (canCastle[color].king && !board[homeRow][5].piece && !board[homeRow][6].piece) {
          moves.push({ from, to: { r: homeRow, c: 6 }, castling: "K" });
        }
        if (
          canCastle[color].queen &&
          !board[homeRow][1].piece &&
          !board[homeRow][2].piece &&
          !board[homeRow][3].piece
        ) {
          moves.push({ from, to: { r: homeRow, c: 2 }, castling: "Q" });
        }
      }
      break;
    }
  }
  return moves;
}

function applyMove(state: GameState, move: Move): GameState {
  const ns: GameState = { ...state, board: cloneBoard(state.board), enPassant: null };
  const { from, to } = move;
  const piece = state.board[from.r][from.c].piece!;
  const color = piece[0] as Color;

  if (move.enPassant) {
    const dir = color === "w" ? 1 : -1;
    ns.board[from.r][to.c].piece = null;
  }

  ns.board[from.r][from.c].piece = null;
  ns.board[to.r][to.c].piece = piece;

  if (piece[1] === "P" && Math.abs(to.r - from.r) === 2) {
    ns.enPassant = { r: (from.r + to.r) / 2, c: from.c };
  }

  if (move.castling) {
    const row = to.r;
    if (move.castling === "K") {
      ns.board[row][7].piece = null;
      ns.board[row][5].piece = `${color}R`;
    } else {
      ns.board[row][0].piece = null;
      ns.board[row][3].piece = `${color}R`;
    }
  }

  if (piece === `${color}K`) {
    ns.canCastle[color] = { king: false, queen: false };
  }
  if (piece === `${color}R`) {
    const homeRow = color === "w" ? 0 : 7;
    if (from.r === homeRow && from.c === 0) {ns.canCastle[color].queen = false;}
    if (from.r === homeRow && from.c === 7) {ns.canCastle[color].king = false;}
  }
  const opp: Color = color === "w" ? "b" : "w";
  const oppHome = opp === "w" ? 0 : 7;
  if (state.board[to.r][to.c].piece === `${opp}R`) {
    if (to.r === oppHome && to.c === 0) {ns.canCastle[opp].queen = false;}
    if (to.r === oppHome && to.c === 7) {ns.canCastle[opp].king = false;}
  }

  if (piece[1] === "P") {
    const lastRank = color === "w" ? 7 : 0;
    if (to.r === lastRank) {
      const promoType = move.promotion ?? "Q";
      ns.board[to.r][to.c].piece = `${color}${promoType}` as Piece;
    }
  }

  ns.turn = ns.turn === "w" ? "b" : "w";
  if (ns.turn === "w") {ns.fullmoveNumber += 1;}
  return ns;
}

function legalMoves(state: GameState, from: Pos): Move[] {
  const pseudo = generatePseudoLegalMoves(state, from);
  const color = state.turn;
  const res: Move[] = [];
  for (const m of pseudo) {
    let ns = applyMove({ ...state, board: cloneBoard(state.board) }, m);
    if (m.castling) {
      const row = m.to.r;
      const cols = m.castling === "K" ? [4, 5, 6] : [4, 3, 2];
      let ok = true;
      for (const c of cols) {
        if (isSquareAttacked(ns.board, { r: row, c }, color === "w" ? "b" : "w")) {
          ok = false;
          break;
        }
      }
      if (!ok) {continue;}
    }
    const k = findKing(ns.board, color);
    if (k && !isSquareAttacked(ns.board, k, color === "w" ? "b" : "w")) {
      res.push(m);
    }
  }
  return res;
}

function pieceToChar(p: Piece): string {
  const map: Record<PieceType, string> = { K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙" };
  const ch = map[p[1] as PieceType];
  return p[0] === "w"
    ? ch
    : (
        {
          "♔": "♚",
          "♕": "♛",
          "♖": "♜",
          "♗": "♝",
          "♘": "♞",
          "♙": "♟",
        } as Record<string, string>
      )[ch] || ch;
}

export const ChessGame: React.FC = () => {
  const [state, setState] = useState<GameState>(() => initialState());
  const [selected, setSelected] = useState<Pos | null>(null);
  const [legal, setLegal] = useState<Move[]>([]);
  const [promotion, setPromotion] = useState<{ from: Pos; to: Pos; color: Color } | null>(null);
  const [status, setStatus] = useState<string>("");
  const boardRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void soundManager.preloadSound("move", "/sounds/click.mp3");
    void soundManager.preloadSound("capture", "/sounds/brick-break.mp3");
    void soundManager.preloadSound("invalid", "/sounds/wall.mp3");
    void soundManager.preloadSound("check", "/sounds/power-up.mp3");
    void soundManager.preloadSound("mate", "/sounds/game-over.mp3");
  }, []);

  const inCheck = useMemo(() => {
    const k = findKing(state.board, state.turn);
    if (!k) {return false;}
    return isSquareAttacked(state.board, k, state.turn === "w" ? "b" : "w");
  }, [state]);

  const hasAnyMove = useMemo(() => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const p = state.board[r][c].piece;
        if (p && p[0] === state.turn) {
          if (legalMoves(state, { r, c }).length) {return true;}
        }
      }
    }
    return false;
  }, [state]);

  const gameOver = useMemo(() => !hasAnyMove, [hasAnyMove]);
  const mate = gameOver && inCheck;

  useEffect(() => {
    if (mate) {
      setStatus(`${state.turn === "w" ? "White" : "Black"} is checkmated`);
      soundManager.playSound("mate", 0.9);
    } else if (gameOver) {
      setStatus("Stalemate");
    } else if (inCheck) {
      setStatus("Check");
      soundManager.playSound("check", 0.7);
    } else {
      setStatus("");
    }
  }, [mate, gameOver, inCheck, state.turn]);

  const onSquareClick = useCallback(
    (r: number, c: number) => {
      if (mate || gameOver) {return;}
      const sq = state.board[r][c];
      const piece = sq.piece;

      if (promotion) {
        return;
      }

      if (selected) {
        const mv = legal.find((m) => m.to.r === r && m.to.c === c);
        if (mv) {
          const movingPiece = state.board[selected.r][selected.c].piece!;
          const color = movingPiece[0] as Color;
          if (movingPiece[1] === "P") {
            const lastRank = color === "w" ? 7 : 0;
            if (r === lastRank) {
              setPromotion({ from: selected, to: { r, c }, color });
              setSelected(null);
              setLegal([]);
              return;
            }
          }

          const ns = applyMove(state, { ...mv });
          setState(ns);
          setSelected(null);
          setLegal([]);
          soundManager.playSound(mv.capture ? "capture" : "move", mv.capture ? 0.8 : 0.5);
          return;
        }
        setSelected(null);
        setLegal([]);
      } else if (piece && piece[0] === state.turn) {
        setSelected({ r, c });
        setLegal(legalMoves(state, { r, c }));
      } else if (piece) {
        soundManager.playSound("invalid", 0.6);
      }
    },
    [state, selected, legal, promotion, mate, gameOver],
  );

  const confirmPromotion = (t: PieceType) => {
    if (!promotion) {return;}
    const mv = legalMoves(state, promotion.from).find(
      (m) => m.to.r === promotion.to.r && m.to.c === promotion.to.c,
    );
    const move = (mv ? { ...mv } : { from: promotion.from, to: promotion.to }) as Move;
    move.promotion = t;
    const ns = applyMove(state, move);
    setState(ns);
    setPromotion(null);
    soundManager.playSound(move.capture ? "capture" : "move", move.capture ? 0.8 : 0.5);
  };

  const uiBoard = useMemo(() => state.board, [state.board]);

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

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={liveRef} className="sr-only" aria-live="polite">
        {status}
      </div>
      <div className="text-lg font-semibold">
        Chess — Turn: {state.turn === "w" ? "White" : "Black"}
      </div>
      {inCheck && !mate && <div className="text-sm text-yellow-300">Check!</div>}
      {mate && (
        <div className="text-sm text-red-400">
          Checkmate. {state.turn === "w" ? "Black" : "White"} wins.
        </div>
      )}
      {gameOver && !mate && <div className="text-sm text-gray-400">Stalemate.</div>}
      <div ref={boardRef} className="grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 3rem)` }}>
        {uiBoard.map((row, r) =>
          row.map((sq, c) => {
            const dark = (r + c) % 2 === 1;
            const isSel = selected && selected.r === r && selected.c === c;
            const isLegal = legal.some((m) => m.to.r === r && m.to.c === c);
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => onSquareClick(r, c)}
                onKeyDown={onSquareKeyDown}
                data-r={r}
                data-c={c}
                className={`w-12 h-12 flex items-center justify-center border text-sm select-none ${
                  dark ? "bg-emerald-900/70 text-white" : "bg-emerald-200 text-emerald-900"
                } ${isSel ? "outline outline-2 outline-yellow-400" : ""}`}
                aria-label={`Square ${String.fromCharCode(97 + c)}${r + 1}${sq.piece ? ", " + (sq.piece[0] === "w" ? "White " : "Black ") + sq.piece[1] : ""}`}
              >
                {sq.piece ? (
                  pieceToChar(sq.piece)
                ) : isLegal ? (
                  <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
                ) : null}
              </button>
            );
          }),
        )}
      </div>
      <div className="text-xs opacity-70">
        Includes castling, en-passant, promotion, and check/mate detection.
      </div>

      {promotion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
            <div className="mb-2 font-semibold">Promote pawn to:</div>
            <div className="flex gap-2">
              {(["Q", "R", "B", "N"] as PieceType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => confirmPromotion(t)}
                  className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                  aria-label={`Promote to ${t}`}
                >
                  {pieceToChar(`${promotion.color}${t}` as Piece)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
