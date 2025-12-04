const REPO = process.env.NEXT_PUBLIC_REPO_URL || "";
const featuredGames = [
  {
    id: 1,
    title: "Block Blast",
    description: "10×10 block puzzle—place pieces and clear full rows/cols for points",
    image: "/colorful-tetris-blocks-falling.jpg",
    tags: ["Grid", "Scoring", "Logic"],
    demoUrl: "/games/block-blast",
    codeUrl: REPO ? `${REPO}/tree/main/frontend/app/games/block-blast` : "#",
    featured: true,
  },
  {
    id: 2,
    title: "Bubble Pop",
    description: "Match 3+ bubbles and drop detached clusters—quick casual fun",
    image: "/retro-snake-game-with-neon-colors.jpg",
    tags: ["Flood fill", "Gravity", "Casual"],
    demoUrl: "/games/bubble-pop",
    codeUrl: "https://github.com/your/repo/tree/main/frontend/app/games/bubble-pop",
    featured: true,
  },
  {
    id: 3,
    title: "Knitzy",
    description: "Thread colors to match the pattern—fill to 100%",
    image: "/colorful-memory-cards-game-interface.jpg",
    tags: ["Puzzle", "Patterns", "Progress"],
    demoUrl: "/games/knitzy",
    codeUrl: "https://github.com/your/repo/tree/main/frontend/app/games/knitzy",
    featured: false,
  },
  {
    id: 4,
    title: "Snake Game",
    description: "Classic snake—coming soon as a consolidated route",
    image: "/breakout-game-with-paddle-and-colorful-bricks.jpg",
    tags: ["Canvas", "Animation"],
    demoUrl: "/games/snake",
    codeUrl: "https://github.com/your/repo/tree/main/games/snake",
    featured: false,
  },
  {
    id: 5,
    title: "Tetris Clone",
    description: "Full‑featured Tetris (coming soon)",
    image: "/2d-platformer-game-with-character-and-obstacles.jpg",
    tags: ["JavaScript", "Game State"],
    demoUrl: "#",
    codeUrl: "#",
    featured: false,
  },
  {
    id: 6,
    title: "Tower Defense",
    description: "Strategic tower defense (coming soon)",
    image: "/tower-defense-game-with-towers-and-enemies.jpg",
    tags: ["Strategy", "Pathfinding"],
    demoUrl: "#",
    codeUrl: "#",
    featured: false,
  },
];

export default function HomePage() {
  const featuredProjects = featuredGames.filter((game) => game.featured);
  const allProjects = featuredGames;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 ml-64">
          <Header />

          <div className="px-8 py-6">
            {/* Hero Section */}
            <section className="mb-12">
              <div className="max-w-4xl">
                <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
                  JavaScript Games & Interactive Projects
                </h1>
                <p className="text-lg text-muted-foreground mb-6 text-pretty">
                  Welcome to a curated collection of web games built with Next.js, React and
                  TypeScript. Play instantly as a guest, or sign in to unlock leaderboards and
                  additional features.
                </p>
                <div className="flex gap-4">
                  <Link href="/login">
                    <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                      <LogIn className="w-4 h-4" /> Sign in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 border-emerald-600 text-emerald-700 dark:text-emerald-400"
                    >
                      <UserPlus className="w-4 h-4" /> Sign up
                    </Button>
                  </Link>
                  <Link href="/games">
                    <Button size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                      <Gamepad2 className="w-4 h-4" /> Play as guest
                    </Button>
                  </Link>
                  <a href={REPO || "#"} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="lg" className="gap-2">
                      <Github className="w-4 h-4" /> GitHub
                    </Button>
                  </a>
                </div>
              </div>
            </section>

            {/* Featured Projects */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Featured Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredProjects.map((game) => (
                  <GameCard key={game.id} game={game} featured />
                ))}
              </div>
            </section>

            {/* All Projects Grid */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6">All Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProjects.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

import { GameCard } from "@/components/game-card";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Gamepad2, Github, LogIn, UserPlus } from "lucide-react";
