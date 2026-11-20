import Link from "next/link"
import { getSession } from "@/lib/data/session"
import { HeaderClient } from "./header-client"

export async function SiteHeader() {
  const { user, profile } = await getSession()
  const name = profile?.full_name ?? user?.email ?? null

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
      <HeaderClient
        logo={
          <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
            Phayi<span className="text-accent">Hairline</span>
          </Link>
        }
        user={user ? { name: name!, isAdmin: profile?.role === "admin" } : null}
      />
    </header>
  )
}
