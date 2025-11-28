'use client';

import dynamic from 'next/dynamic';
import {SoundProvider} from '@games/shared/contexts/SoundContext';

const TowerDefenseGame = dynamic(
  () => import('@games/tower-defense/components/TowerDefenseGame').then((m) => m.TowerDefenseGame),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    ),
  }
);

export default function TowerDefensePage() {
  return (
    <SoundProvider>
      <TowerDefenseGame/>
    </SoundProvider>
  );
}
