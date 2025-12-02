// games/tower-defense/src/components/TowerDefenseGame.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { soundManager } from "@games/shared";

// Minimal Tower Defense prototype: one path, simple waves, basic towers
const TILE = 32;
const COLS = 20;
const ROWS = 12;

// Path represented as a list of waypoints (tile centers)
const PATH: { x: number; y: number }[] = [
  { x: 0, y: 5 },
  { x: 5, y: 5 },
  { x: 5, y: 2 },
  { x: 10, y: 2 },
  { x: 10, y: 8 },
  { x: 19, y: 8 },
];

type Creep = { x: number; y: number; hp: number; speed: number; wp: number; alive: boolean };
type Tower = { x: number; y: number; r: number; cd: number; fireRate: number };
type Shot = { x: number; y: number; vx: number; vy: number; dmg: number; alive: boolean };

function dist(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

export const TowerDefenseGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lives, setLives] = useState(20);
  const [money, setMoney] = useState(100);
  const [wave, setWave] = useState(1);
  const [status, setStatus] = useState<"idle" | "spawning" | "running" | "won" | "lost">("idle");
  const creeps = useRef<Creep[]>([]);
  const towers = useRef<Tower[]>([]);
  const shots = useRef<Shot[]>([]);
  const spawnTimer = useRef(0);
  const raf = useRef<number | null>(null);

  const startWave = useCallback(() => {
    setStatus("spawning");
    spawnTimer.current = 0;
  }, []);

  const placeTower = useCallback(
    (tx: number, ty: number) => {
      // prevent placing on path (rough check by proximity to path segments)
      for (let i = 0; i < PATH.length - 1; i++) {
        const a = PATH[i],
          b = PATH[i + 1];
        // distance from tile center to segment
        const cx = tx + 0.5,
          cy = ty + 0.5;
        const vx = b.x - a.x,
          vy = b.y - a.y;
        const wx = cx - a.x,
          wy = cy - a.y;
        const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy || 1)));
        const px = a.x + t * vx,
          py = a.y + t * vy;
        if (dist(cx, cy, px, py) < 0.9) {
          return;
        } // too close to path
      }
      if (money < 50) {
        return;
      }
      towers.current.push({ x: tx + 0.5, y: ty + 0.5, r: 3.0, cd: 0, fireRate: 0.6 });
      setMoney((m) => m - 50);
      soundManager.playSound("click", 0.5);
    },
    [money],
  );

  const step = useCallback(
    (dt: number) => {
      if (status === "spawning") {
        spawnTimer.current += dt;
        // spawn a creep every 0.8s for N creeps per wave
        const creepCount = 6 + wave * 2;
        const interval = 0.8;
        const toSpawn = Math.floor(spawnTimer.current / interval);
        for (let i = creeps.current.length; i < Math.min(toSpawn, creepCount); i++) {
          creeps.current.push({
            x: PATH[0].x + 0.5,
            y: PATH[0].y + 0.5,
            hp: 30 + wave * 10,
            speed: 2 + wave * 0.2,
            wp: 1,
            alive: true,
          });
        }
        if (toSpawn >= creepCount) {
          setStatus("running");
        }
      }

      // move creeps along path
      creeps.current.forEach((c) => {
        if (!c.alive) {
          return;
        }
        const target = PATH[c.wp];
        if (!target) {
          return;
        } // reached end (should be handled below)
        const dx = target.x + 0.5 - c.x;
        const dy = target.y + 0.5 - c.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.05) {
          c.wp++;
          if (c.wp >= PATH.length) {
            c.alive = false;
            setLives((L) => Math.max(0, L - 1));
          }
        } else {
          c.x += (dx / (d || 1)) * (c.speed * dt);
          c.y += (dy / (d || 1)) * (c.speed * dt);
        }
      });

      // towers: acquire target and shoot
      towers.current.forEach((t) => {
        t.cd -= dt;
        if (t.cd > 0) {
          return;
        }
        // find nearest creep in range
        let best: Creep | null = null;
        let bestD = Infinity;
        for (const c of creeps.current) {
          if (!c.alive) {
            continue;
          }
          const d = dist(t.x, t.y, c.x, c.y);
          if (d <= t.r && d < bestD) {
            best = c;
            bestD = d;
          }
        }
        if (best) {
          const speed = 8; // tiles per second
          const dx = best.x - t.x;
          const dy = best.y - t.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          shots.current.push({
            x: t.x,
            y: t.y,
            vx: (dx / len) * speed,
            vy: (dy / len) * speed,
            dmg: 15,
            alive: true,
          });
          t.cd = 1 / t.fireRate;
          soundManager.playSound("paddle", 0.4);
        }
      });

      // advance shots
      shots.current.forEach((s) => {
        if (!s.alive) {
          return;
        }
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        // hits?
        for (const c of creeps.current) {
          if (!c.alive) {
            continue;
          }
          if (dist(s.x, s.y, c.x, c.y) < 0.3) {
            s.alive = false;
            c.hp -= s.dmg;
            setMoney((m) => m + 2);
            if (c.hp <= 0) {
              c.alive = false;
              setMoney((m) => m + 5);
              soundManager.playSound("brickBreak", 0.6);
            }
            break;
          }
        }
        // out of bounds
        if (s.x < 0 || s.y < 0 || s.x > COLS || s.y > ROWS) {
          s.alive = false;
        }
      });

      // remove dead
      creeps.current = creeps.current.filter((c) => c.alive);
      shots.current = shots.current.filter((s) => s.alive);

      // wave end conditions
      if (
        (status === "running" || status === "spawning") &&
        creeps.current.length === 0 &&
        status !== "spawning"
      ) {
        setWave((w) => w + 1);
        setStatus("idle");
      }
      if (lives <= 0 && status !== "lost") {
        setStatus("lost");
      }
    },
    [lives, status, wave],
  );

  const render = useCallback(() => {
    const cnv = canvasRef.current;
    if (!cnv) {
      return;
    }
    const ctx = cnv.getContext("2d");
    if (!ctx) {
      return;
    }
    const w = COLS * TILE;
    const h = ROWS * TILE;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0b1020";
    ctx.fillRect(0, 0, w, h);

    // draw path
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i < PATH.length; i++) {
      const p = PATH[i];
      const x = p.x * TILE + TILE / 2;
      const y = p.y * TILE + TILE / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // towers
    for (const t of towers.current) {
      ctx.fillStyle = "#a78bfa";
      ctx.beginPath();
      ctx.arc(t.x * TILE, t.y * TILE, 10, 0, Math.PI * 2);
      ctx.fill();
      // range ring
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.beginPath();
      ctx.arc(t.x * TILE, t.y * TILE, t.r * TILE, 0, Math.PI * 2);
      ctx.stroke();
    }

    // creeps
    for (const c of creeps.current) {
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.arc(c.x * TILE, c.y * TILE, 8, 0, Math.PI * 2);
      ctx.fill();
      // hp bar
      ctx.fillStyle = "#111827";
      ctx.fillRect(c.x * TILE - 12, c.y * TILE - 16, 24, 4);
      ctx.fillStyle = "#10b981";
      const hpPct = Math.max(0, Math.min(1, c.hp / (30 + wave * 10)));
      ctx.fillRect(c.x * TILE - 12, c.y * TILE - 16, 24 * hpPct, 4);
    }

    // shots
    ctx.fillStyle = "#f43f5e";
    for (const s of shots.current) {
      ctx.beginPath();
      ctx.arc(s.x * TILE, s.y * TILE, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // HUD
    ctx.fillStyle = "white";
    ctx.font = "14px system-ui, -apple-system";
    ctx.fillText(`Lives: ${lives}`, 8, 18);
    ctx.fillText(`Money: $${money}`, 100, 18);
    ctx.fillText(`Wave: ${wave} (${status})`, 210, 18);
  }, [lives, money, status, wave]);

  // Animation loop and handlers
  useEffect(() => {
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      step(dt);
      render();
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    const onClick = (e: MouseEvent) => {
      const c = canvasRef.current;
      if (!c) {
        return;
      }
      const rect = c.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / TILE);
      const y = Math.floor((e.clientY - rect.top) / TILE);
      placeTower(x, y);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "n" && (status === "idle" || status === "won")) {
        startWave();
      }
      if (e.key.toLowerCase() === "r") {
        creeps.current = [];
        shots.current = [];
        towers.current = [];
        setLives(20);
        setMoney(100);
        setWave(1);
        setStatus("idle");
      }
    };
    const cnv = canvasRef.current;
    cnv?.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
      cnv?.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [status, wave, lives, money, placeTower, startWave, step, render]);

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        width={COLS * TILE}
        height={ROWS * TILE}
        className="rounded-lg shadow-lg border border-gray-700"
        aria-label="Tower Defense prototype"
      />
      <div className="mt-2 text-sm text-gray-300">
        Click to place a tower ($50). Press N to start next wave, R to reset.
      </div>
    </div>
  );
};
