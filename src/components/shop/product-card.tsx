"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Heart, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/ui/product-image"
import { RatingLine } from "./star-rating"
import { useCart } from "@/stores/cart"
import { useWishlist } from "@/stores/wishlist"
import { useMounted } from "@/hooks/use-mounted"
import { cn, discountPercent, formatNaira } from "@/lib/utils"
import type { Product } from "@/types"

export function WishlistButton({ product, className }: { product: Product; className?: string }) {
  const mounted = useMounted()
  const saved = useWishlist((s) => s.items.some((i) => i.id === product.id))
  const toggle = useWishlist((s) => s.toggle)
  const active = mounted && saved

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault()
        toast(toggle(product) ? "Saved to wishlist" : "Removed from wishlist")
      }}
      className={cn("rounded-full bg-background/90 p-2 shadow-sm backdrop-blur transition-colors hover:bg-background", className)}
    >
      <Heart className={cn("size-4 transition-colors", active && "fill-destructive text-destructive")} />
    </motion.button>
  )
}

export function ProductCard({ product, headingLevel = 3 }: { product: Product; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as const
  const add = useCart((s) => s.add)
  const discount = discountPercent(product.price, product.compare_at_price)
  const soldOut = product.stock < 1
  const hasOptions = product.option_names.length > 0
  const href = `/products/${product.category}/${product.slug}`

  return (
    <motion.article whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={href} className="block size-full" aria-label={product.name}>
          <div className="size-full transition-transform duration-700 group-hover:scale-105">
            <ProductImage src={product.images[0]} alt={product.name} />
          </div>
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && <Badge variant="accent">-{discount}%</Badge>}
          {soldOut && <Badge variant="muted">Sold out</Badge>}
        </div>
        <WishlistButton product={product} className="absolute right-3 top-3" />
      </div>

      <div className="space-y-2 p-4">
        <Link href={href}><Heading className="line-clamp-1 font-sans text-base font-medium">{product.name}</Heading></Link>
        <RatingLine rating={product.rating} count={product.review_count} />
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-semibold">{hasOptions && <span className="mr-1 text-xs font-normal text-muted-foreground">From</span>}{formatNaira(product.price)}</p>
            {product.compare_at_price && (
              <p className="text-xs text-muted-foreground line-through">{formatNaira(product.compare_at_price)}</p>
            )}
          </div>
          {hasOptions ? (
            <Button asChild size="sm" variant="secondary" disabled={soldOut}>
              <Link href={href}>Options <ArrowRight /></Link>
            </Button>
          ) : (
            <Button size="sm" disabled={soldOut} aria-label={`Add ${product.name} to cart`}
              onClick={() => { add(product); toast.success("Added to cart") }}>
              <ShoppingBag /> Add
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
