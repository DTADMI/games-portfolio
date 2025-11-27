import { GameCard } from "@/components/game-card"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Github, ExternalLink } from "lucide-react"

const featuredGames = [
  {
    id: 1,
    title: "Snake Game",
    description: "Classic snake game with modern twist and smooth animations",
    image: "/retro-snake-game-with-neon-colors.jpg",
    tags: ["Canvas", "Game Logic", "Animation"],
    demoUrl: "#",
    codeUrl: "#",
    featured: true,
  },
  {
    id: 2,
    title: "Tetris Clone",
    description: "Full-featured Tetris implementation with scoring and levels",
    image: "/colorful-tetris-blocks-falling.jpg",
    tags: ["JavaScript", "DOM", "Game State"],
    demoUrl: "#",
    codeUrl: "#",
    featured: true,
  },
  {
    id: 3,
    title: "Memory Card Game",
    description: "Interactive memory game with multiple difficulty levels",
    image: "/colorful-memory-cards-game-interface.jpg",
    tags: ["React", "State Management", "Animation"],
    demoUrl: "#",
    codeUrl: "#",
    featured: false,
  },
  {
    id: 4,
    title: "Breakout Game",
    description: "Classic brick-breaking game with power-ups and effects",
    image: "/breakout-game-with-paddle-and-colorful-bricks.jpg",
    tags: ["Canvas", "Physics", "Collision Detection"],
    demoUrl: "#",
    codeUrl: "#",
    featured: false,
  },
  {
    id: 5,
    title: "Puzzle Platformer",
    description: "2D platformer with physics-based puzzles and smooth controls",
    image: "/2d-platformer-game-with-character-and-obstacles.jpg",
    tags: ["Game Engine", "Physics", "Level Design"],
    demoUrl: "#",
    codeUrl: "#",
    featured: false,
  },
  {
    id: 6,
    title: "Tower Defense",
    description: "Strategic tower defense game with multiple tower types",
    image: "/tower-defense-game-with-towers-and-enemies.jpg",
    tags: ["Strategy", "Pathfinding", "Game Balance"],
    demoUrl: "#",
    codeUrl: "#",
    featured: false,
  },
]

export default function HomePage() {
  const featuredProjects = featuredGames.filter((game) => game.featured)
  const allProjects = featuredGames

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
                  Welcome to my collection of interactive games and projects built with JavaScript. Each project
                  showcases different aspects of game development, from classic arcade games to modern interactive
                  experiences.
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
  )
}
