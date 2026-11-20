"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, CalendarCheck } from "lucide-react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/section"

const ease = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div style={{ y: orbY }} aria-hidden
        className="absolute -right-32 -top-32 size-[520px] rounded-full bg-gradient-to-br from-accent/40 to-transparent blur-3xl" />
      <motion.div style={{ y: orbY }} aria-hidden
        className="absolute -bottom-40 -left-24 size-[420px] rounded-full bg-gradient-to-tr from-primary/20 to-transparent blur-3xl" />

      <Container className="relative py-24 md:py-36">
        <motion.div style={{ y: textY }} className="max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Lagos · Wigs · Frontals · Tools
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="text-5xl font-semibold leading-[1.05] md:text-7xl">
            Your hairline, <span className="italic text-accent">flawlessly</span> done.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.25 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground">
            Premium human hair wigs, lace frontals and professional tools, installed by stylists who obsess over a
            natural finish.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.4 }}
            className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link href="/products/wigs">Shop wigs <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/services"><CalendarCheck /> Book installation</Link></Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
