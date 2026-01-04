"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍌</span>
            <span className="text-xl font-bold">Nano Banana</span>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#generator" className="text-sm font-medium transition-colors hover:text-yellow-500">
              Generator
            </a>
            <a href="#features" className="text-sm font-medium transition-colors hover:text-yellow-500">
              Features
            </a>
            <a href="#showcase" className="text-sm font-medium transition-colors hover:text-yellow-500">
              Showcase
            </a>
            <a href="#reviews" className="text-sm font-medium transition-colors hover:text-yellow-500">
              Reviews
            </a>
            <a href="#faq" className="text-sm font-medium transition-colors hover:text-yellow-500">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button className="hidden bg-yellow-500 text-black hover:bg-yellow-600 sm:inline-flex">Try Now</Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              <a href="#generator" className="text-sm font-medium">
                Generator
              </a>
              <a href="#features" className="text-sm font-medium">
                Features
              </a>
              <a href="#showcase" className="text-sm font-medium">
                Showcase
              </a>
              <a href="#reviews" className="text-sm font-medium">
                Reviews
              </a>
              <a href="#faq" className="text-sm font-medium">
                FAQ
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
