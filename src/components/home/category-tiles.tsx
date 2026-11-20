import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion"
import { Container, SectionHeading } from "@/components/ui/section"
import type { Category } from "@/types"

export function CategoryTiles({ categories }: { categories: Category[] }) {
  if (!categories.length) return null
  return (
    <section className="py-12 md:py-16">
      <Container>
        <Reveal><SectionHeading eyebrow="Collections" title="Shop by category" /></Reveal>
        <Stagger className="grid gap-4 md:grid-cols-3 md:gap-5">
          {categories.map((c) => (
            <StaggerItem key={c.slug}>
              <Link href={`/products/${c.slug}`}
                className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-xl border bg-gradient-to-br from-secondary via-card to-muted p-5 transition duration-300 hover:shadow-xl active:scale-[0.99] md:h-64 md:p-6">
                <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/20 blur-2xl transition-transform duration-700 group-hover:scale-150" />
                <ArrowUpRight className="absolute right-5 top-5 size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                <h3 className="text-2xl font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  )
}
