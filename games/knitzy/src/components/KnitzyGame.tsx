// games/knitzy/src/components/KnitzyGame.tsx
'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {soundManager} from '@games/shared';

// Board settings
const SIZE = 12; // 12x12
const CELL = 32;
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

type Grid = number[][]; // -1 empty (work), else color index

function makeTarget(size = SIZE): Grid {
  // Simple mirrored pattern with 3–4 colors
  const g: Grid = Array.from({length: size}, () => Array(size).fill(0));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < Math.ceil(size / 2); x++) {
      const c = Math.floor(Math.random() * COLORS.length);
      g[y][x] = c;
      g[y][size - 1 - x] = c; // mirror horizontally
    }
  }
  return g;
}

function emptyGrid(size = SIZE): Grid {
  return Array.from({length: size}, () => Array(size).fill(-1));
}

function progress(target: Grid, work: Grid): number {
  let ok = 0;
  let total = target.length * target[0].length;
  for (let y = 0; y < target.length; y++) {
    for (let x = 0; x < target[0].length; x++) {
      if (work[y][x] >= 0 && work[y][x] === target[y][x]) ok++;
    }
  }
  return Math.round((ok / total) * 100);
}

function copy(g: Grid): Grid {
  return g.map(r => r.slice());
}

export const KnitzyGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [target, setTarget] = useState<Grid>(() => makeTarget());
  const [work, setWork] = useState<Grid>(() => emptyGrid());
  const [color, setColor] = useState(0);
  const [pct, setPct] = useState(0);
  const [startTs] = useState<number>(() => Date.now());
  const [bestMs, setBestMs] = useState<number | null>(null);
  const [mouseDown, setMouseDown] = useState(false);

  useEffect(() => {
    try {
      const ms = parseInt(localStorage.getItem('knitzy:bestMs') || '0', 10);
      if (!isNaN(ms) && ms > 0) setBestMs(ms);
    } catch {
    }
  }, []);

  // draw both target (left) and work (right)
  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const gap = 20;
    const boardPx = SIZE * CELL;
    const w = boardPx * 2 + gap * 3;
    const h = boardPx + gap * 2 + 60; // space for HUD

    if (c.width !== Math.floor(w * dpr) || c.height !== Math.floor(h * dpr)) {
      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    }

    // background
    ctx.fillStyle = '#0b1020';
    ctx.fillRect(0, 0, w, h);

    const drawBoard = (gx: number, gy: number, grid: Grid, showEmpty: boolean) => {
      // panel
      ctx.fillStyle = '#111827';
      ctx.fillRect(gx - gap / 2, gy - gap / 2, boardPx + gap, boardPx + gap);

      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          const val = grid[y][x];
          const px = gx + x * CELL;
          const py = gy + y * CELL;

          // cell bg
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px, py, CELL, CELL);

          if (val >= 0) {
            ctx.fillStyle = COLORS[val % COLORS.length];
            ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
          } else if (showEmpty) {
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.strokeRect(px + 2, py + 2, CELL - 4, CELL - 4);
          }
        }
      }

      // grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      for (let x = 0; x <= SIZE; x++) {
        ctx.beginPath();
        ctx.moveTo(gx + x * CELL, gy);
        ctx.lineTo(gx + x * CELL, gy + boardPx);
        ctx.stroke();
      }
      for (let y = 0; y <= SIZE; y++) {
        ctx.beginPath();
        ctx.moveTo(gx, gy + y * CELL);
        ctx.lineTo(gx + boardPx, gy + y * CELL);
        ctx.stroke();
      }
    };

    const leftX = gap, topY = gap + 40;
    drawBoard(leftX, topY, target, false);
    drawBoard(leftX + boardPx + gap, topY, work, true);

    // headers
    ctx.fillStyle = 'white';
    ctx.font = '16px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('Target', leftX, gap + 24);
    ctx.fillText('Your Work', leftX + boardPx + gap, gap + 24);

    // HUD
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(`Progress: ${pct}%`, gap, boardPx + gap * 2 + 30);
    if (bestMs) ctx.fillText(`Best: ${(bestMs / 1000).toFixed(1)}s`, gap + 150, boardPx + gap * 2 + 30);

    // palette
    const paletteY = gap;
    let palX = leftX + boardPx + gap;
    ctx.fillText('Palette', palX, paletteY - 8);
    for (let i = 0; i < COLORS.length; i++) {
      const wCell = 24;
      const hCell = 24;
      const pad = 6;
      const x = palX + i * (wCell + pad);
      const y = paletteY + 4;
      ctx.fillStyle = COLORS[i];
      ctx.fillRect(x, y, wCell, hCell);
      ctx.strokeStyle = i === color ? 'white' : 'rgba(255,255,255,0.35)';
      ctx.lineWidth = i === color ? 2 : 1;
      ctx.strokeRect(x, y, wCell, hCell);
    }
  }, [target, work, pct, bestMs, color]);

  useEffect(() => {
    draw();
  }, [draw]);

  // mouse painting on the WORK board
  const handlePointer = (clientX: number, clientY: number, isClick = false) => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const boardPx = SIZE * CELL;
    const gap = 20;
    const leftX = gap;
    const topY = gap + 40; // target
    const workX = leftX + boardPx + gap;
    const workY = topY;

    const x = Math.floor(((clientX - rect.left) - workX) / CELL);
    const y = Math.floor(((clientY - rect.top) - workY) / CELL);
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;

    setWork((prev) => {
      const next = copy(prev);
      next[y][x] = color;
      return next;
    });
    if (isClick) soundManager.playSound('click', 0.5);
  };

  const onMouseDown: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    setMouseDown(true);
    handlePointer(e.clientX, e.clientY, true);
  };
  const onMouseMove: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!mouseDown) return;
    handlePointer(e.clientX, e.clientY, false);
  };
  const onMouseUp = () => setMouseDown(false);
  const onMouseLeave = () => setMouseDown(false);

  // progress + completion check
  useEffect(() => {
    const p = progress(target, work);
    setPct(p);
    if (p >= 100) {
      const ms = Date.now() - startTs;
      try {
        const best = parseInt(localStorage.getItem('knitzy:bestMs') || '0', 10);
        if (isNaN(best) || best === 0 || ms < best) {
          localStorage.setItem('knitzy:bestMs', String(ms));
          setBestMs(ms);
        }
      } catch {
      }
      soundManager.playSound('levelComplete', 0.8);
    }
  }, [target, work, startTs]);

  const reset = () => {
    setTarget(makeTarget());
    setWork(emptyGrid());
    setPct(0);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        className="rounded-lg shadow-lg border border-gray-700"
        width={(SIZE * CELL) * 2 + 60}
        height={(SIZE * CELL) + 120}
        aria-label={`Knitzy. Progress ${pct} percent.`}
      />
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm text-gray-300">Color:</span>
        {COLORS.map((c, i) => (
          <button
            key={i}
            onClick={() => setColor(i)}
            className={`w-6 h-6 rounded ${i === color ? 'ring-2 ring-white' : 'ring-1 ring-gray-500'}`}
            style={{backgroundColor: c}}
            aria-label={`Select color ${i + 1}`}
          />
        ))}
        <button onClick={reset} className="ml-4 px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700">New
          Pattern
        </button>
      </div>
      <div aria-live="polite" className="sr-only">Progress {pct} percent.</div>
    </div>
  );
};
