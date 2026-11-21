import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteShell } from "@/components/layout/site-shell"
import { Container } from "@/components/ui/section"

export const metadata: Metadata = { title: "Page not found", robots: { index: false } }

export default function NotFound() {
  // The root 404 renders outside the (site) group, so bring the storefront frame along.
  return (
    <SiteShell>
    <Container className="py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-text">404</p>
      <h1 className="mt-3 text-4xl font-semibold md:text-5xl">We couldn&apos;t find that page</h1>
      <p className="mx-auto mt-4 max-w-md text-muted-foreground">
        The link may be old, or the product may no longer be available.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg"><Link href="/products/wigs">Shop wigs</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/">Back to home</Link></Button>
      </div>
    </Container>
    </SiteShell>
  )
}
