import { LazyDrawers } from "./lazy-drawers"
import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

/** The storefront frame: header, page, footer, and the cart / wishlist / menu drawers they open. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="min-h-[70dvh] outline-none">{children}</main>
      <SiteFooter />
      <LazyDrawers />
    </>
  )
}
