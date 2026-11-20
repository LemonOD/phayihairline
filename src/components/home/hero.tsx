"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, CalendarCheck } from "lucide-react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/section"

/**
 * The headline/CTAs animate with plain CSS (see `.rise` in globals.css) so they are visible
 * straight from the server-rendered HTML — no waiting for JS to hydrate (better LCP).
 * Only the decorative background uses Framer Motion.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 120])

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Radial gradients instead of blur filters: same look, far cheaper to paint. */}
      <motion.div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[560px] rounded-full will-change-transform"
        style={{ y: orbY, background: "radial-gradient(closest-side, color-mix(in oklch, var(--accent) 38%, transparent), transparent)" }} />
      <motion.div aria-hidden className="pointer-events-none absolute -bottom-48 -left-32 size-[480px] rounded-full will-change-transform"
        style={{ y: orbY, background: "radial-gradient(closest-side, color-mix(in oklch, var(--primary) 18%, transparent), transparent)" }} />

      <Container className="relative py-24 md:py-36">
        <div className="max-w-3xl">
          <p className="rise mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent-text">
            Lagos · Wigs · Frontals · Tools
          </p>
          <h1 className="rise-lift text-5xl font-semibold leading-[1.05] md:text-7xl">
            Your hairline, <span className="italic text-accent-text">flawlessly</span> done.
          </h1>
          <p className="rise mt-6 max-w-xl text-lg text-muted-foreground" style={{ animationDelay: "0.12s" }}>
            Premium human hair wigs, lace frontals and professional tools, installed by stylists who obsess over a
            natural finish.
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "0.22s" }}>
            <Button asChild size="lg"><Link href="/products/wigs">Shop wigs <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/services"><CalendarCheck /> Book installation</Link></Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
