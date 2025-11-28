// games/memory/src/app/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { SoundProvider } from '@games/shared/contexts/SoundContext';

// Dynamically import the game component with SSR disabled
const MemoryGame = dynamic(
  () => import('@/components/MemoryGame').then(mod => mod.MemoryGame),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    )
  }
);

export default function MemoryGamePage() {
  return (
    <SoundProvider>
      <MemoryGame />
    </SoundProvider>
  );
}