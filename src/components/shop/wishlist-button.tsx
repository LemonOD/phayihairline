"use client"

import { Heart } from "lucide-react"
import { toast } from "sonner"
import { useMounted } from "@/hooks/use-mounted"
import { useWishlist } from "@/stores/wishlist"
import { cn } from "@/lib/utils"
import type { ProductSummary } from "@/types"

export function WishlistButton({ product, className }: { product: ProductSummary; className?: string }) {
  const mounted = useMounted()
  const saved = useWishlist((s) => s.items.some((i) => i.id === product.id))
  const toggle = useWishlist((s) => s.toggle)
  const active = mounted && saved

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault()
        toast(toggle(product) ? "Saved to wishlist" : "Removed from wishlist")
      }}
      className={cn(
        "flex size-10 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition hover:bg-background active:scale-90 motion-reduce:transition-none",
        className,
      )}
    >
      <Heart className={cn("size-[18px] transition-all duration-200", active && "scale-110 fill-destructive text-destructive")} />
    </button>
  )
}
