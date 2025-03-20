"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Search, Menu, X, Phone } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet"
import { useMobile } from "@/src/hooks/use-mobile"
import CartDrawer from "@/src/components/cart-drawer"
import WishlistDrawer from "@/src/components/wishlist-drawer"
import { ThemeToggle } from "@/src/components/theme-toggle"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Wigs", href: "/products/wigs" },
  { name: "Frontals", href: "/products/frontals" },
  { name: "Tools", href: "/products/tools" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export default function SiteHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const isMobile = useMobile()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // In a real app, this would navigate to search results
      console.log("Searching for:", searchQuery)
      setIsSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar with contact info */}
      <div className="hidden md:flex items-center justify-between bg-muted/40 px-4 py-2 text-sm">
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-primary" />
          <span>08155217967</span>
        </div>
        <div>
          <p>Adamo, Ikorodu, Lagos State, Nigeria</p>
        </div>
      </div>

      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-lg ${pathname === item.href ? "font-medium text-primary" : "text-muted-foreground"}`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/public" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl text-primary">PhayiHairline</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center ml-auto">
          {isSearchOpen && !isMobile ? (
            <div className="relative w-full max-w-sm mr-2 flex items-center">
              <form onSubmit={handleSearch} className="w-full">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pr-8"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery.trim()) {
                      setIsSearchOpen(false)
                    }
                  }}
                />
              </form>
              <X
                className="absolute right-2 h-4 w-4 text-muted-foreground cursor-pointer"
                onClick={() => {
                  setIsSearchOpen(false)
                  setSearchQuery("")
                }}
              />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="mr-1">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <WishlistDrawer />

          <Button variant="ghost" size="icon" className="mr-1">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>

          <CartDrawer />

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

