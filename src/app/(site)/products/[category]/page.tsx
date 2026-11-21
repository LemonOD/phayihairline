import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { ProductFilters } from "@/components/shop/product-filters"
import { ProductGrid } from "@/components/shop/product-grid"
import { PageTransition } from "@/components/ui/motion"
import { Container } from "@/components/ui/section"
import { getCategories, getProducts, type SortKey } from "@/lib/data/catalog"
import { cn } from "@/lib/utils"

type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

const SORTS: SortKey[] = ["newest", "price-asc", "price-desc", "rating"]
const num = (v?: string) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const match = (await getCategories()).find((c) => c.slug === category)
  return match ? { title: match.name, description: match.description } : {}
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params
  const sp = await searchParams
  const categories = await getCategories()
  const current = categories.find((c) => c.slug === category)
  if (!current) notFound()

  const products = await getProducts({
    category,
    q: sp.q,
    min: num(sp.min),
    max: num(sp.max),
    sort: SORTS.includes(sp.sort as SortKey) ? (sp.sort as SortKey) : "newest",
  })

  return (
    <PageTransition>
      <Container className="py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-semibold md:text-5xl">{current.name}</h1>
          <p className="mt-2 text-muted-foreground">{current.description}</p>
          <nav className="mt-5 flex flex-wrap gap-2" aria-label="Categories">
            {categories.map((c) => (
              <Link key={c.slug} href={`/products/${c.slug}`}
                className={cn("tap rounded-full border px-4 text-sm transition duration-150 active:scale-95 hover:bg-muted",
                  c.slug === category && "border-primary bg-primary text-primary-foreground hover:bg-primary")}>
                {c.name}
              </Link>
            ))}
          </nav>
        </header>

        <Suspense><ProductFilters total={products.length} /></Suspense>

        {products.length ? (
          <ProductGrid products={products} headingLevel={2} />
        ) : (
          <p className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
            No products match your filters.
          </p>
        )}
      </Container>
    </PageTransition>
  )
}
