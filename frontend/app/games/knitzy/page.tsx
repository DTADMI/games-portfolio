'use client';

import dynamic from 'next/dynamic';
import {SoundProvider} from '@games/shared/contexts/SoundContext';

const KnitzyGame = dynamic(
  () => import('@games/knitzy/components/KnitzyGame').then((m) => m.KnitzyGame),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    ),
  }
);

export default function KnitzyPage() {
  return (
    <SoundProvider>
      <KnitzyGame/>
    </SoundProvider>
  );
}
