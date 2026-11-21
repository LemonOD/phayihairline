"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransition } from "react"
import { Heart, LayoutDashboard, LogOut, MessageCircle, Moon, Sun, User, ChevronRight } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet } from "@/components/ui/sheet"
import { signOut } from "@/lib/actions/auth"
import { siteConfig, cn } from "@/lib/utils"
import { whatsappLink } from "@/lib/whatsapp"
import { navLinks } from "./nav-links"
import { useAuth } from "@/stores/auth"
import { useUI } from "@/stores/ui"
import { useWishlist } from "@/stores/wishlist"

const row = "flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-[15px] font-medium transition-colors active:bg-muted hover:bg-muted"

/** Phone navigation: a left drawer with large tap targets, the secondary actions, and a WhatsApp shortcut. */
export function MobileNav() {
  const open = useUI((s) => s.menuOpen)
  const setOpen = useUI((s) => s.setMenuOpen)
  const pathname = usePathname()
  const auth = useAuth()
  const wishCount = useWishlist((s) => s.items.length)
  const setWishOpen = useWishlist((s) => s.setOpen)
  const { resolvedTheme, setTheme } = useTheme()
  const [, start] = useTransition()
  const close = () => setOpen(false)
  const dark = resolvedTheme === "dark"

  return (
    <Sheet open={open} onOpenChange={setOpen} side="left" title={siteConfig.name} description="Site navigation">
      <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-3">
        <ul>
          {navLinks.map((l) => {
            const active = pathname.startsWith(l.href)
            return (
              <li key={l.href}>
                <Link href={l.href} onClick={close} aria-current={active ? "page" : undefined}
                  className={cn("flex min-h-14 items-center justify-between rounded-lg px-3 font-serif text-xl transition-colors active:bg-muted hover:bg-muted", active && "text-accent-text")}>
                  {l.label}
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-0.5 border-t px-3 py-2">
        <button type="button" className={row} onClick={() => { close(); setWishOpen(true) }}>
          <Heart className="size-5 text-muted-foreground" aria-hidden /> Wishlist
          {wishCount > 0 && <span className="ml-auto rounded-full bg-accent px-2 text-xs font-bold text-accent-foreground">{wishCount}</span>}
        </button>
        {auth.status === "user" ? (
          <>
            <Link href="/account" className={row} onClick={close}><User className="size-5 text-muted-foreground" aria-hidden /> My account</Link>
            {auth.isAdmin && <Link href="/admin" className={row} onClick={close}><LayoutDashboard className="size-5 text-muted-foreground" aria-hidden /> Admin</Link>}
          </>
        ) : (
          <Link href="/login" className={row} onClick={close}><User className="size-5 text-muted-foreground" aria-hidden /> Sign in or create account</Link>
        )}
        <button type="button" className={row} onClick={() => setTheme(dark ? "light" : "dark")}>
          {dark ? <Sun className="size-5 text-muted-foreground" aria-hidden /> : <Moon className="size-5 text-muted-foreground" aria-hidden />}
          {dark ? "Light mode" : "Dark mode"}
        </button>
        {auth.status === "user" && (
          <button type="button" className={row} onClick={() => {
            useAuth.setState({ status: "anon" }, true)
            close()
            start(() => signOut())
          }}>
            <LogOut className="size-5 text-muted-foreground" aria-hidden /> Sign out
          </button>
        )}
      </div>

      <div className="border-t p-4 pb-safe">
        <Button asChild variant="accent" size="lg" className="w-full">
          <a href={whatsappLink(`Hello ${siteConfig.name}!`)} target="_blank" rel="noopener noreferrer">
            <MessageCircle /> Chat with us on WhatsApp
          </a>
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">{siteConfig.tagline}</p>
      </div>
    </Sheet>
  )
}
