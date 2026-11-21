import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Check, ChevronRight } from "lucide-react"
import { ProductPurchase } from "@/components/shop/product-purchase"
import { ReviewsSection } from "@/components/shop/reviews-section"
import { StarRating } from "@/components/shop/star-rating"
import { ProductGallery } from "@/components/shop/product-gallery"
import { ProductGrid } from "@/components/shop/product-grid"
import { PageTransition, Reveal } from "@/components/ui/motion"
import { JsonLd } from "@/components/layout/json-ld"
import { Container } from "@/components/ui/section"
import { getProductBySlug, getProductSlugs, getRelatedProducts } from "@/lib/data/catalog"

export const revalidate = 60

export async function generateStaticParams() {
  return (await getProductSlugs()).map(({ category, slug }) => ({ category, slug }))
}

type Props = { params: Promise<{ category: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images.slice(0, 1) },
  }
}

export default async function ProductPage({ params }: Props) {
  const { category, slug } = await params
  const product = await getProductBySlug(slug)
  if (!product || product.category !== category) notFound()

  const related = await getRelatedProducts(product)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    ...(product.review_count > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.review_count },
    }),
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.price,
      lowPrice: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  }

  return (
    <PageTransition>
      <JsonLd data={jsonLd} />
      <Container className="pb-32 pt-4 md:py-10">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm text-muted-foreground [scrollbar-width:none] md:mb-6 [&::-webkit-scrollbar]:hidden">
          <Link href="/" className="tap hover:text-foreground">Home</Link><ChevronRight className="size-3" />
          <Link href={`/products/${category}`} className="tap capitalize hover:text-foreground">{category}</Link>
          <ChevronRight className="size-3" /><span className="line-clamp-1 text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
          <ProductGallery images={product.images} name={product.name} />

          <div className="min-w-0 space-y-6">
            <div>
              {product.review_count > 0 && (
                <a href="#reviews" className="mb-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <StarRating value={product.rating} /> {product.rating.toFixed(1)} · {product.review_count} review{product.review_count === 1 ? "" : "s"}
                </a>
              )}
              <h1 className="text-[1.75rem] font-semibold leading-tight md:text-4xl">{product.name}</h1>
            </div>

            <p className="leading-relaxed text-muted-foreground">{product.description}</p>

            <ProductPurchase product={product} />

            {product.features.length > 0 && (
              <ul className="grid gap-2 border-t pt-6 sm:grid-cols-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="size-4 text-accent-text" /> {f}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <Suspense fallback={null}><ReviewsSection product={product} /></Suspense>

        {related.length > 0 && (
          <Reveal className="mt-20">
            <h2 className="mb-6 text-2xl font-semibold">You may also like</h2>
            <ProductGrid products={related} />
          </Reveal>
        )}
      </Container>
    </PageTransition>
  )
}
