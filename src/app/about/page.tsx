import type { Metadata } from "next"
import Link from "next/link"
import { Gem, HeartHandshake, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageTransition, Reveal } from "@/components/ui/motion"
import { Container, SectionHeading } from "@/components/ui/section"

export const metadata: Metadata = { title: "About us" }

const values = [
  { icon: Gem, title: "Quality first", text: "Every wig, frontal and tool is hand-picked and checked before it reaches you." },
  { icon: Sparkles, title: "Natural finish", text: "Our work is judged by how undetectable it looks, so we obsess over the hairline." },
  { icon: HeartHandshake, title: "Personal service", text: "From first consultation to aftercare, you deal with real people who know your name." },
]

export default function AboutPage() {
  return (
    <PageTransition>
      <Container className="max-w-4xl py-12">
        <SectionHeading eyebrow="Our story" title="Beauty that starts at the hairline"
          description="PhayiHairline is a Lagos studio and store for premium wigs, frontals and installation." />
        <Reveal className="space-y-4 text-center text-lg leading-relaxed text-muted-foreground">
          <p>We started with a simple belief: a great wig should be indistinguishable from your own hair. That means better materials, better installs and honest advice.</p>
          <p>Today we serve customers across Nigeria with a curated range of human hair wigs, lace frontals and the professional tools to maintain them, plus a studio in Adamo, Ikorodu for installations.</p>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.1} className="text-center">
              <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-accent/20 text-accent-text"><Icon className="size-5" /></span>
              <h3 className="font-sans font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-14 text-center"><Button asChild size="lg"><Link href="/services">See our services</Link></Button></div>
      </Container>
    </PageTransition>
  )
}
