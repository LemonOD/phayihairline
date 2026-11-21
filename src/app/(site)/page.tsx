import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Hero } from "@/components/home/hero"
import { CategoryTiles } from "@/components/home/category-tiles"
import { TrustStrip } from "@/components/home/trust-strip"
import { ProductGrid } from "@/components/shop/product-grid"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/ui/motion"
import { Container, SectionHeading } from "@/components/ui/section"
import { JsonLd } from "@/components/layout/json-ld"
import { localBusinessJsonLd } from "@/lib/seo"
import { getCategories, getFeaturedProducts } from "@/lib/data/catalog"

export const revalidate = 60

export default async function HomePage() {
  const [categories, featuredAll] = await Promise.all([getCategories(), getFeaturedProducts(12)])
  // Lead with products that have real photos; a card with a placeholder icon cheapens the first impression.
  const withPhotos = featuredAll.filter((p) => p.images.length > 0)
  const featured = (withPhotos.length ? withPhotos : featuredAll).slice(0, 8)

  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <Hero />
      <TrustStrip />
      <CategoryTiles categories={categories} />
      {featured.length > 0 && (
        <section className="pb-6 md:pb-8">
          <Container>
            <Reveal><SectionHeading eyebrow="Bestsellers" title="Featured products" description="Our most-loved pieces, picked by you." /></Reveal>
            <ProductGrid products={featured} />
            <div className="mt-10 text-center">
              <Button asChild variant="outline" size="lg"><Link href="/products/wigs">Browse all <ArrowRight /></Link></Button>
            </div>
          </Container>
        </section>
      )}
    </>
  )
}
