// frontend/app/games/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

const GAMES = [
  {
    id: 'snake',
    title: 'Snake Game',
    description: 'Classic snake game with modern twist and smooth animations',
    image: '/images/games/snake-preview.jpg',
    tags: ['Classic', 'Arcade', 'Single Player'],
    featured: true,
  },
  {
    id: 'memory',
    title: 'Memory Card Game',
    description: 'Test your memory with this fun card matching game',
    image: '/images/games/memory-preview.jpg',
    tags: ['Puzzle', 'Memory', 'Single Player'],
    featured: true,
  },
  {
    id: 'breakout',
    title: 'Breakout',
    description: 'Break all the bricks with the ball and avoid missing it',
    image: '/images/games/breakout-preview.jpg',
    tags: ['Arcade', 'Action', 'Single Player'],
    featured: true,
  },
  {
    id: 'tetris',
    title: 'Tetris',
    description: 'Classic tile-matching puzzle game',
    image: '/images/games/tetris-preview.jpg',
    tags: ['Puzzle', 'Arcade', 'Single Player'],
    comingSoon: true,
  },
  {
    id: 'platformer',
    title: 'Puzzle Platformer',
    description: '2D platformer with challenging puzzles',
    image: '/images/games/platformer-preview.jpg',
    tags: ['Platformer', 'Puzzle', 'Adventure'],
    comingSoon: true,
  },
  {
    id: 'tower-defense',
    title: 'Tower Defense',
    description: 'Strategic tower defense game',
    image: '/images/games/tower-defense-preview.jpg',
    tags: ['Strategy', 'Tactical', 'Single Player'],
    comingSoon: true,
  },
];

export default function GamesPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Game Collection
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
            Play our collection of fun and challenging games
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <div
              key={game.id}
              className="group bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <Image
                  src={game.image}
                  alt={game.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {game.comingSoon && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {game.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {game.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {game.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {!game.comingSoon ? (
                  <Link
                    href={`/games/${game.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Play Now
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-400 bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {!user && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Sign in to save your progress and compete on leaderboards!
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In / Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}