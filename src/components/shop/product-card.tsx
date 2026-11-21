import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/ui/product-image"
import { AddToCartButton } from "./add-to-cart-button"
import { RatingLine } from "./star-rating"
import { WishlistButton } from "./wishlist-button"
import { discountPercent, formatNaira } from "@/lib/utils"
import type { Product } from "@/types"

/**
 * Server Component: only the two buttons hydrate. They get a slim summary, not the whole product.
 *
 * Layout adapts to the card's own width (container query), not the screen's: in a narrow card (two across
 * on a phone) the price gets its own line and the button spans the card, so nothing is ever clipped; from
 * ~256px the price and button share one row. Cards in a row stretch to equal height, with the price and
 * button pinned to the bottom.
 *
 * The whole card is one tap target via a stretched link on the title; the wishlist heart and the action
 * button sit above it with `z-10`.
 */
export function ProductCard({ product, headingLevel = 3 }: { product: Product; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as const
  const discount = discountPercent(product.price, product.compare_at_price)
  const soldOut = product.stock < 1
  const hasOptions = product.option_names.length > 0
  const href = `/products/${product.category}/${product.slug}`
  const summary = {
    id: product.id, slug: product.slug, name: product.name, price: product.price, category: product.category,
    stock: product.stock, option_names: product.option_names, images: product.images.slice(0, 1),
  }
  const action = "relative z-10 w-full @min-[16rem]:w-auto"

  return (
    <article className="@container group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition duration-300 active:scale-[0.99] md:hover:-translate-y-1 md:hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-muted">
        <div className="size-full transition-transform duration-700 md:group-hover:scale-105 motion-reduce:transition-none">
          <ProductImage src={product.images[0]} alt="" />
        </div>
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {discount > 0 && <Badge variant="accent">-{discount}%</Badge>}
          {soldOut && <Badge variant="muted">Sold out</Badge>}
        </div>
        <WishlistButton product={summary} className="absolute right-2 top-2 z-10" />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 @min-[16rem]:p-4">
        <Heading className="line-clamp-2 font-sans text-[15px] font-medium leading-snug @min-[16rem]:text-base">
          <Link href={href}
            className="rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring">
            {product.name}
          </Link>
        </Heading>
        <RatingLine rating={product.rating} count={product.review_count} />

        <div className="mt-auto flex flex-col gap-3 pt-3 @min-[16rem]:flex-row @min-[16rem]:items-end @min-[16rem]:justify-between @min-[16rem]:gap-2">
          <div className="min-w-0">
            {/* "From" sits above the price in a narrow card and inline with it in a wide one. */}
            <p className="flex flex-wrap items-baseline gap-x-1.5 leading-tight">
              {hasOptions && (
                <span className="w-full text-[11px] uppercase tracking-wide text-muted-foreground @min-[16rem]:w-auto @min-[16rem]:text-xs @min-[16rem]:normal-case @min-[16rem]:tracking-normal">From</span>
              )}
              <span className="text-lg font-semibold">{formatNaira(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-xs text-muted-foreground line-through">{formatNaira(product.compare_at_price)}</span>
              )}
            </p>
          </div>
          {soldOut ? (
            <Button size="sm" variant="secondary" disabled className={action}>Sold out</Button>
          ) : hasOptions ? (
            <Button asChild size="sm" variant="secondary" className={action}>
              <Link href={href} aria-label={`Choose options for ${product.name}`}>Options <ArrowRight /></Link>
            </Button>
          ) : (
            <AddToCartButton product={summary} className={action} />
          )}
        </div>
      </div>
    </article>
  )
}
