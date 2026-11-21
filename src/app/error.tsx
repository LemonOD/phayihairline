"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/section"
import { siteConfig } from "@/lib/utils"
import { whatsappLink } from "@/lib/whatsapp"

/** Segment-level boundary: the header and footer stay, only the page area shows the fallback. */
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Container className="py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-text">Something went wrong</p>
      <h1 className="mt-3 text-4xl font-semibold md:text-5xl">We couldn&apos;t load this page</h1>
      <p className="mx-auto mt-4 max-w-md text-muted-foreground">
        This is usually temporary. Please try again, or message us on WhatsApp and we will help you directly.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={() => retry()}>Try again</Button>
        <Button asChild size="lg" variant="outline"><Link href="/">Back to home</Link></Button>
        <Button asChild size="lg" variant="ghost">
          <a href={whatsappLink(`Hello ${siteConfig.name}!`)} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
        </Button>
      </div>
    </Container>
  )
}
