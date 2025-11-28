'use client';

import dynamic from 'next/dynamic';
import { SoundProvider } from '@games/shared/contexts/SoundContext';

const BubblePopGame = dynamic(
  () => import('@games/bubble-pop/components/BubblePopGame').then((m) => m.BubblePopGame),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    ),
  }
);

export default function BubblePopPage() {
  return (
    <SoundProvider>
      <BubblePopGame />
    </SoundProvider>
  );
}
