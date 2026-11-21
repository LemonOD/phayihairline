"use client"

import Image from "next/image"
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

      <Container className="relative grid items-center gap-8 pb-10 pt-8 md:gap-10 md:py-28 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-3xl">
          <p className="rise mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-text sm:mb-4 sm:text-xs sm:tracking-[0.3em]">
            <span className="sm:hidden">Luxury hair · Worldwide</span>
            <span className="hidden sm:inline">Worldwide · Luxury hair · Wigs · Revamping</span>
          </p>
          <h1 className="rise-lift text-[2.5rem] font-semibold leading-[1.05] sm:text-5xl md:text-7xl">
            Luxury hair, <span className="italic text-accent-text">affordably</span> yours.
          </h1>
          <p className="rise mt-4 max-w-xl text-base text-muted-foreground sm:mt-6 sm:text-lg" style={{ animationDelay: "0.12s" }}>
            Premium wigs, bundles, closures and frontals, plus custom units made to order. Slay everyday, and save while you do it.
          </p>
          <div className="rise mt-6 flex flex-col gap-3 sm:mt-9 sm:flex-row" style={{ animationDelay: "0.22s" }}>
            <Button asChild size="lg" className="w-full sm:w-auto"><Link href="/products/wigs">Shop wigs <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto"><Link href="/services"><CalendarCheck /> Book installation</Link></Button>
          </div>
        </div>
        <div className="rise relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl border shadow-xl sm:aspect-[4/4.6]" style={{ animationDelay: "0.15s" }}>
          <Image src="/brand/brand-portrait-bags.jpg" alt="Phayihairline founder holding branded gift bags, wearing a silky straight unit"
            fill priority sizes="(max-width:1024px) 90vw, 40vw" className="object-cover" />
        </div>
      </Container>
    </section>
  )
}
