import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Github, ExternalLink } from "lucide-react"
import Image from "next/image"

interface Game {
  id: number
  title: string
  description: string
  image: string
  tags: string[]
  demoUrl: string
  codeUrl: string
  featured?: boolean
}

interface GameCardProps {
  game: Game
  featured?: boolean
}

export function GameCard({ game, featured = false }: GameCardProps) {
  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${featured ? "ring-2 ring-primary/20" : ""}`}
    >
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          <Image
            src={game.image || "/placeholder.svg"}
            alt={game.title}
            width={300}
            height={200}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button size="lg" className="gap-2">
              <Play className="w-4 h-4" />
              Play Demo
            </Button>
          </div>
          {featured && <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">Featured</Badge>}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-card-foreground mb-2 text-balance">{game.title}</h3>
        <p className="text-muted-foreground mb-4 text-pretty">{game.description}</p>
        <div className="flex flex-wrap gap-2">
          {game.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button className="flex-1 gap-2" asChild>
          <a href={game.demoUrl}>
            <ExternalLink className="w-4 h-4" />
            Live Demo
          </a>
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent" asChild>
          <a href={game.codeUrl}>
            <Github className="w-4 h-4" />
            Code
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
