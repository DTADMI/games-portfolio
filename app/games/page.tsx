import Link from 'next/link';

const games = [
    {
        id: 'snake',
        name: 'Snake',
        description: 'Classic Snake game. Eat the food and grow as long as possible!',
        path: '/games/snake',
        image: '/images/snake-preview.png',
    },
    {
        id: 'tetris',
        name: 'Tetris',
        description: 'Classic Tetris. Complete lines to score points!',
        path: '/games/tetris',
        image: '/images/tetris-preview.png',
    },
];

export default function GamesPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Games</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                    <Link
                        key={game.id}
                        href={game.path}
                        className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                            <div className="text-gray-500">Game Preview</div>
                        </div>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-2">{game.name}</h2>
                            <p className="text-gray-600">{game.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}