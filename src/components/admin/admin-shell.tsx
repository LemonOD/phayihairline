"use client"

import Link from "next/link"
import { useState } from "react"
import { ExternalLink, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Sheet } from "@/components/ui/sheet"
import { AdminBrand } from "./admin-brand"
import { AdminNav, type AdminCounts } from "./admin-nav"
import { AdminUserMenu } from "./admin-user-menu"

type Props = { name: string; email: string; counts: AdminCounts; children: React.ReactNode }

const storeLink = "flex min-h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

/**
 * The back-office frame. Desktop (lg+): a fixed sidebar with the navigation and the account.
 * Phone and tablet: a slim top bar and a menu drawer, so the content gets the full width.
 */
export function AdminShell({ name, email, counts, children }: Props) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="min-h-dvh bg-muted/30 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="hidden border-r bg-background lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="border-b px-4 py-3"><AdminBrand /></div>
        <div className="flex-1 overflow-y-auto p-3"><AdminNav counts={counts} /></div>
        <div className="space-y-1 border-t p-3">
          <Link href="/" target="_blank" rel="noopener noreferrer" className={storeLink}>
            <ExternalLink className="size-[18px]" aria-hidden /> View store <span className="sr-only">(opens in a new tab)</span>
          </Link>
          <div className="flex items-center gap-1">
            <div className="min-w-0 flex-1"><AdminUserMenu name={name} email={email} variant="row" /></div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b bg-background/90 px-3 backdrop-blur-lg sm:px-5 lg:hidden">
          <div className="flex min-w-0 items-center gap-1">
            <button type="button" aria-label="Open menu" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}
              className="flex size-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted active:scale-95">
              <Menu className="size-5" />
            </button>
            <AdminBrand />
          </div>
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <AdminUserMenu name={name} email={email} />
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-6 outline-none sm:px-6 md:py-8 lg:px-10">
          {children}
        </main>
      </div>

      <Sheet open={open} onOpenChange={setOpen} side="left" title="Admin menu" description="Back-office navigation">
        <div className="flex-1 overflow-y-auto p-3"><AdminNav counts={counts} onNavigate={close} /></div>
        <div className="border-t p-3 pb-safe">
          <Link href="/" target="_blank" rel="noopener noreferrer" onClick={close} className={storeLink}>
            <ExternalLink className="size-[18px]" aria-hidden /> View store <span className="sr-only">(opens in a new tab)</span>
          </Link>
        </div>
      </Sheet>
    </div>
  )
}
