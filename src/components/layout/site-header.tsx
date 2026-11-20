import Link from "next/link"
import { BrandMark } from "./brand-mark"
import { HeaderClient } from "./header-client"

/** Static shell: auth-dependent bits are resolved on the client so every page stays cacheable. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
      <HeaderClient
        logo={
          <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight">
            <BrandMark />
            <span>Phayi<span className="text-accent-text">Hairline</span></span>
          </Link>
        }
      />
    </header>
  )
}
