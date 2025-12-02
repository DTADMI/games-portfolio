import { Board, Color, GameState, Move, Piece, PieceType, Pos, SIZE, Square } from "./types";

function inBounds(r: number, c: number) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function sameColor(a: Piece | null, b: Piece | null) {
  if (!a || !b) {return false;}
  return a[0] === b[0];
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((s) => ({ piece: s.piece })));
}

export function initialState(): GameState {
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

export function findKing(board: Board, color: Color): Pos | null {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c].piece;
      if (p === `${color}K`) {return { r, c };}
    }
  }
  return null;
}

export function isSquareAttacked(board: Board, target: Pos, byColor: Color): boolean {
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

export function generatePseudoLegalMoves(state: GameState, from: Pos): Move[] {
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
      // En passant: state.enPassant stores the middle square behind the pawn that double-stepped.
      // A capturing pawn moves to its forward-diagonal square: { r: from.r + dir, c: enPassant.c }.
      if (enPassant) {
        if (Math.abs(enPassant.c - from.c) === 1 && enPassant.r === from.r + dir + dir) {
          const dest = { r: from.r + dir, c: enPassant.c };
          if (inBounds(dest.r, dest.c) && !board[dest.r][dest.c].piece) {
            moves.push({ from, to: dest, enPassant: true, capture: true });
          }
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

export function applyMove(state: GameState, move: Move): GameState {
  const ns: GameState = { ...state, board: cloneBoard(state.board), enPassant: null };
  const { from, to } = move;
  const piece = state.board[from.r][from.c].piece!;
  const color = piece[0] as Color;

  // En passant capture removes the pawn that advanced two squares last move
  if (move.enPassant) {
    ns.board[from.r][to.c].piece = null;
  }

  ns.board[from.r][from.c].piece = null;
  ns.board[to.r][to.c].piece = piece;

  if (piece[1] === "P" && Math.abs(to.r - from.r) === 2) {
    // Store the middle square between from/to to signal en passant availability
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

export function legalMoves(state: GameState, from: Pos): Move[] {
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
