"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { Menu, User, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name && !user?.email) return 'U'
    const name = user.user_metadata?.full_name || user.email
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍌</span>
            <span className="text-xl font-bold">Nano Banano</span>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="/#generator" className="text-sm font-medium transition-colors hover:text-yellow-500">
              Generator
            </a>
            <a href="/#features" className="text-sm font-medium transition-colors hover:text-yellow-500">
              Features
            </a>
            <a href="/pricing" className="text-sm font-medium transition-colors hover:text-yellow-500">
              Pricing
            </a>
            <a href="/#showcase" className="text-sm font-medium transition-colors hover:text-yellow-500">
              Showcase
            </a>
            <a href="/#reviews" className="text-sm font-medium transition-colors hover:text-yellow-500">
              Reviews
            </a>
            <a href="/#faq" className="text-sm font-medium transition-colors hover:text-yellow-500">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.user_metadata?.full_name || user.email || 'User'}
                      />
                      <AvatarFallback className="bg-yellow-500 text-black">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => router.push('/login')}
                className="hidden bg-yellow-500 text-black hover:bg-yellow-600 sm:inline-flex"
              >
                Sign In
              </Button>
            )}
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
              <a href="/#generator" className="text-sm font-medium">
                Generator
              </a>
              <a href="/#features" className="text-sm font-medium">
                Features
              </a>
              <a href="/pricing" className="text-sm font-medium">
                Pricing
              </a>
              <a href="/#showcase" className="text-sm font-medium">
                Showcase
              </a>
              <a href="/#reviews" className="text-sm font-medium">
                Reviews
              </a>
              <a href="/#faq" className="text-sm font-medium">
                FAQ
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
