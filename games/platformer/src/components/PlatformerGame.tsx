// games/platformer/src/components/PlatformerGame.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { soundManager } from "@games/shared";

// Minimal platformer constants
const TILE = 32;
const COLS = 20;
const ROWS = 12;
const GRAVITY = 0.5;
const JUMP_VY = -8.5;
const MOVE_VX = 2.2;

// Simple tilemap: 0 empty, 1 solid, 2 collectible, 3 goal
const MAP: number[][] = (() => {
  const m = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  // floor
  for (let x = 0; x < COLS; x++) {
    m[ROWS - 1][x] = 1;
  }
  // some platforms
  for (let x = 3; x < 7; x++) {
    m[ROWS - 4][x] = 1;
  }
  for (let x = 10; x < 15; x++) {
    m[ROWS - 6][x] = 1;
  }
  // collectibles
  m[ROWS - 7][12] = 2;
  m[ROWS - 5][5] = 2;
  m[ROWS - 2][2] = 2;
  // goal
  m[ROWS - 2][COLS - 3] = 3;
  m[ROWS - 2][COLS - 2] = 3;
  return m;
})();

function solidAt(tx: number, ty: number) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) {
    return true;
  }
  return MAP[ty][tx] === 1;
}

export const PlatformerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const keys = useRef<Record<string, boolean>>({});

  // player
  const player = useRef({
    x: 2 * TILE,
    y: (ROWS - 3) * TILE,
    vx: 0,
    vy: 0,
    w: 24,
    h: 28,
    onGround: false,
  });
  const rafId = useRef<number | null>(null);

  // Animation loop
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      keys.current[e.key] = e.type === "keydown";
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  function aabbTileCollision(px: number, py: number, w: number, h: number) {
    // Check tiles overlapped by player rect
    const left = Math.floor(px / TILE);
    const right = Math.floor((px + w) / TILE);
    const top = Math.floor(py / TILE);
    const bottom = Math.floor((py + h) / TILE);
    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        if (solidAt(tx, ty)) {
          return true;
        }
      }
    }
    return false;
  }

  const step = useCallback(
    (_dt: number) => {
      const p = player.current;
      if (won) {
        return;
      }

      // input
      p.vx = 0;
      if (keys.current["ArrowLeft"] || keys.current["a"]) {
        p.vx = -MOVE_VX;
      }
      if (keys.current["ArrowRight"] || keys.current["d"]) {
        p.vx = MOVE_VX;
      }
      if ((keys.current["ArrowUp"] || keys.current["w"] || keys.current[" "]) && p.onGround) {
        p.vy = JUMP_VY;
        p.onGround = false;
        soundManager.playSound("click", 0.5);
      }

      // gravity
      p.vy += GRAVITY;

      // horizontal move
      let nx = p.x + p.vx;
      let ny = p.y;
      if (aabbTileCollision(nx, ny, p.w, p.h)) {
        // try resolve horizontally
        const dir = Math.sign(p.vx) || 1;
        while (!aabbTileCollision(p.x + Math.sign(dir), ny, p.w, p.h)) {
          p.x += Math.sign(dir);
        }
        p.vx = 0;
        nx = p.x;
      }
      p.x = nx;

      // vertical move
      ny = p.y + p.vy;
      if (aabbTileCollision(p.x, ny, p.w, p.h)) {
        const dirY = Math.sign(p.vy) || 1;
        while (!aabbTileCollision(p.x, p.y + Math.sign(dirY), p.w, p.h)) {
          p.y += Math.sign(dirY);
        }
        if (dirY > 0) {
          p.onGround = true;
        } // landing
        p.vy = 0;
        ny = p.y;
      } else {
        p.onGround = false;
      }
      p.y = ny;

      // collectibles & goal
      const cx = Math.floor((p.x + p.w / 2) / TILE);
      const cy = Math.floor((p.y + p.h / 2) / TILE);
      if (cx >= 0 && cy >= 0 && cx < COLS && cy < ROWS) {
        if (MAP[cy][cx] === 2) {
          MAP[cy][cx] = 0;
          setScore((s) => s + 100);
          soundManager.playSound("powerUp", 0.6);
        } else if (MAP[cy][cx] === 3) {
          setWon(true);
          soundManager.playSound("levelComplete", 0.9);
        }
      }
    },
    [won],
  );

  const render = useCallback(() => {
    const c = canvasRef.current;
    if (!c) {
      return;
    }
    const ctx = c.getContext("2d");
    if (!ctx) {
      return;
    }
    const w = COLS * TILE;
    const h = ROWS * TILE;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0b1020";
    ctx.fillRect(0, 0, w, h);

    // tiles
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const t = MAP[y][x];
        if (t === 1) {
          ctx.fillStyle = "#374151";
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
        if (t === 2) {
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.arc(x * TILE + 16, y * TILE + 16, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        if (t === 3) {
          ctx.fillStyle = "#10b981";
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
      }
    }

    // player
    const p = player.current;
    ctx.fillStyle = "#60a5fa";
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.w, p.h);

    // HUD
    ctx.fillStyle = "white";
    ctx.font = "14px system-ui, -apple-system";
    ctx.fillText(`Score: ${score}`, 8, 18);
    if (won) {
      ctx.fillText("Goal reached! Press R to restart.", 8, 36);
    }
  }, [score, won]);

  useEffect(() => {
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(1 / 30, (t - last) / 1000);
      last = t;
      step(dt);
      render();
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") {
        // reset
        player.current = {
          x: 2 * TILE,
          y: (ROWS - 3) * TILE,
          vx: 0,
          vy: 0,
          w: 24,
          h: 28,
          onGround: false,
        };
        setScore(0);
        setWon(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      window.removeEventListener("keydown", onKey);
    };
  }, [won, render, step]);

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        width={COLS * TILE}
        height={ROWS * TILE}
        className="rounded-lg shadow-lg border border-gray-700"
        aria-label="Platformer game"
      />
      <div className="mt-2 text-sm text-gray-300">
        Arrows/WASD to move & jump. Press R to restart.
      </div>
    </div>
  );
};
