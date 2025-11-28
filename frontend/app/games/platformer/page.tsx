'use client';

import dynamic from 'next/dynamic';
import {SoundProvider} from '@games/shared/contexts/SoundContext';

const PlatformerGame = dynamic(
  () => import('@games/platformer/components/PlatformerGame').then((m) => m.PlatformerGame),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    ),
  }
);

export default function PlatformerPage() {
  return (
    <SoundProvider>
      <PlatformerGame/>
    </SoundProvider>
  );
}
