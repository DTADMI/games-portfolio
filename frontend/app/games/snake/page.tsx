'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SoundProvider, soundManager, useSound } from '@games/shared';
import { PresenceBadge } from '@/components/presence-badge';
import { useStomp } from '@/lib/realtime/useStomp';
import { useFeature } from '@/lib/flags';

const SnakeGame = dynamic(
  () => import('@games/snake/components/SnakeGame').then((m) => m.SnakeGame),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    ),
  }
);

const SnakeGame3D = dynamic(
  () => import('@games/snake/components/SnakeGame3D').then((m) => m.SnakeGame3D),
  {
    ssr: false,
  }
);

function DifficultySelector() {
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>(() => {
    if (typeof window === 'undefined') return 'normal';
    return ((localStorage.getItem('snakeDifficulty') as 'easy' | 'normal' | 'hard' | null) ?? 'normal');
  });

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('snake:setDifficulty', { detail: { difficulty } }));
  }, [difficulty]);

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {(['easy', 'normal', 'hard'] as const).map((d) => (
        <button
          key={d}
          onClick={() => setDifficulty(d)}
          className={`px-3 py-1 rounded-md text-sm ${
            difficulty === d
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
          }`}
          aria-pressed={difficulty === d}
        >{d[0].toUpperCase() + d.slice(1)}</button>
      ))}
    </div>
  );
}

function TouchControls() {
  const sendKey = useCallback((key: string) => {
    // Dispatch a keydown event so the game, which listens to keyboard, reacts to touch buttons
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  }, []);

  const controls = useMemo(
    () => (
      <div className="pointer-events-none fixed inset-0 flex flex-col justify-end p-4 gap-4">
        <div className="pointer-events-auto mx-auto grid grid-cols-3 gap-3">
          <button
            aria-label="Up"
            className="row-start-1 col-start-2 rounded-full size-14 bg-black/40 text-white backdrop-blur hover:bg-black/50 active:scale-95"
            onClick={() => sendKey('ArrowUp')}
          >▲</button>
          <button
            aria-label="Left"
            className="row-start-2 col-start-1 rounded-full size-14 bg-black/40 text-white backdrop-blur hover:bg-black/50 active:scale-95"
            onClick={() => sendKey('ArrowLeft')}
          >◀</button>
          <button
            aria-label="Down"
            className="row-start-2 col-start-2 rounded-full size-14 bg-black/40 text-white backdrop-blur hover:bg-black/50 active:scale-95"
            onClick={() => sendKey('ArrowDown')}
          >▼</button>
          <button
            aria-label="Right"
            className="row-start-2 col-start-3 rounded-full size-14 bg-black/40 text-white backdrop-blur hover:bg-black/50 active:scale-95"
            onClick={() => sendKey('ArrowRight')}
          >▶</button>
        </div>
        <div className="pointer-events-auto flex justify-center">
          <button
            aria-label="Pause or resume"
            className="rounded-full px-6 py-3 bg-emerald-600 text-white shadow-md hover:bg-emerald-700 active:scale-95"
            onClick={() => sendKey(' ')}
          >Pause / Resume</button>
        </div>
      </div>
    ),
    [sendKey]
  );

  return controls;
}

function SoundControls() {
  const { isMuted, toggleMute, setVolume, volume } = useSound();
  return (
    <div className="flex items-center justify-center gap-3 mb-3">
      <button
        onClick={toggleMute}
        className={`px-3 py-1 rounded-md text-sm ${isMuted ? 'bg-gray-700 text-white' : 'bg-emerald-600 text-white'}`}
        aria-pressed={isMuted}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >{isMuted ? 'Unmute' : 'Mute'}</button>
      <input
        aria-label="Volume"
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-40 accent-emerald-600"
      />
    </div>
  );
}

function LeaderboardPanel() {
  const [scores, setScores] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const parsed = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  useEffect(() => {
    const refresh = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
        setScores(Array.isArray(parsed) ? parsed : []);
      } catch {}
    };
    window.addEventListener('snake:leaderboardUpdated', refresh);
    return () => window.removeEventListener('snake:leaderboardUpdated', refresh);
  }, []);

  if (!scores.length) return null;
  return (
    <div className="mx-auto mt-4 max-w-md rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white/70 dark:bg-gray-800/70">
      <h3 className="font-semibold mb-2">Top Scores</h3>
      <ol className="list-decimal list-inside text-sm">
        {scores.map((s, i) => (
          <li key={i} className="py-0.5">{s}</li>
        ))}
      </ol>
    </div>
  );
}

export default function SnakeGamePage() {
  const realtimeEnabled = useFeature('realtime_enabled', true, { preferBackend: true });
  const threeDEnabled = useFeature('snake_3d_mode', false, { preferBackend: true });
  const [use3D, setUse3D] = useState(() => (typeof window !== 'undefined' && localStorage.getItem('snake:3d') === '1'));
  const { publish, subscribe, connected } = useStomp({ enabled: realtimeEnabled });
  useEffect(() => {
    const preloadSounds = async () => {
      try {
        await Promise.all([
          soundManager.preloadSound('eat', '/sounds/eat.mp3'),
          soundManager.preloadSound('gameOver', '/sounds/game-over.mp3'),
          soundManager.preloadSound('background', '/sounds/snake-bg.mp3', true),
        ]);
      } catch (error) {
        console.warn('Error preloading sounds:', error);
      }
    };

    preloadSounds();

    // When the game ends, publish the score to STOMP (if enabled)
    const onGameOver = (e: Event) => {
      if (!realtimeEnabled) return;
      const detail = (e as CustomEvent).detail as { score?: number } | undefined;
      const score = detail?.score ?? 0;
      const nickname = (typeof localStorage !== 'undefined' && localStorage.getItem('nickname')) || 'guest';
      const env = {
        type: 'score',
        room: { id: 'snake:global', game: 'snake', visibility: 'public' },
        user: { id: undefined, role: 'guest', nickname, subscription: 'free' },
        payload: { value: score }
      };
      try { publish('/app/snake/score', env); } catch {}
    };
    window.addEventListener('snake:gameover', onGameOver as EventListener);

    return () => {
      window.removeEventListener('snake:gameover', onGameOver as EventListener);
      soundManager.stopCurrentMusic();
    };
  }, [publish, realtimeEnabled]);

  return (
    <SoundProvider>
      <div className="relative min-h-[80vh]">
        <div className="pt-4">
          <DifficultySelector />
          <SoundControls />
        </div>
        <div className="flex items-center justify-between px-4">
          {realtimeEnabled ? <PresenceBadge game="snake" /> : <span className="text-xs text-amber-700">Realtime disabled — using snapshot</span>}
          {realtimeEnabled && connected && <span className="text-xs text-gray-500">Realtime on</span>}
        </div>
        {threeDEnabled && (
          <div className="flex items-center justify-center mb-3">
            <button
              onClick={() => { const n = !use3D; setUse3D(n); try { localStorage.setItem('snake:3d', n ? '1' : '0'); } catch {} }}
              className={`px-3 py-1 rounded-md text-sm ${use3D ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-100'}`}
            >{use3D ? '3D Mode On' : 'Enable 3D Mode'}</button>
          </div>
        )}
        {use3D && threeDEnabled ? <SnakeGame3D /> : <SnakeGame />}
        <LeaderboardPanel />
        {/* On-screen touch controls for mobile and desktop */}
        <TouchControls />
      </div>
    </SoundProvider>
  );
}
