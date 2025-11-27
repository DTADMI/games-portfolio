import { Button } from "@/components/ui/button"
import { Home, Gamepad2, User, Mail, Github, ExternalLink } from "lucide-react"

const navigation = [
  { name: "Home", href: "#", icon: Home, current: true },
  { name: "Games", href: "#games", icon: Gamepad2, current: false },
  { name: "About", href: "#about", icon: User, current: false },
  { name: "Contact", href: "#contact", icon: Mail, current: false },
]

const socialLinks = [
  { name: "GitHub", href: "#", icon: Github },
  { name: "Portfolio", href: "#", icon: ExternalLink },
]

export function Sidebar() {
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">DevGames</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.name}
                variant={item.current ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                asChild
              >
                <a href={item.href}>
                  <Icon className="w-4 h-4" />
                  {item.name}
                </a>
              </Button>
            )
          })}
        </nav>

        {/* Social Links */}
        <div className="px-4 py-6 border-t border-sidebar-border">
          <div className="space-y-2">
            {socialLinks.map((link) => {
              const Icon = link.icon
              return (
                <Button
                  key={link.name}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-3 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                  asChild
                >
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </a>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
