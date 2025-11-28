'use client';

import dynamic from 'next/dynamic';
import { SoundProvider } from '@games/shared/contexts/SoundContext';

const MemoryGame = dynamic(
  () => import('@games/memory/components/MemoryGame').then((m) => m.MemoryGame),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    ),
  }
);

export default function MemoryGamePage() {
  return (
    <SoundProvider>
      <MemoryGame />
    </SoundProvider>
  );
}
