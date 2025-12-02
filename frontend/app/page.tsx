import { GameCard } from "@/components/game-card";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

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
                  Welcome to my collection of interactive games and projects built with JavaScript.
                  Each project showcases different aspects of game development, from classic arcade
                  games to modern interactive experiences.
                </p>
                <div className="flex gap-4">
                  <Button size="lg" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View All Projects
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                    <Github className="w-4 h-4" />
                    GitHub Profile
                  </Button>
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
