"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, ShoppingBag, X } from "lucide-react"
import { toast } from "sonner"
import { Sheet } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/ui/product-image"
import { useWishlist } from "@/stores/wishlist"
import { useCart } from "@/stores/cart"
import { useIsDesktop } from "@/hooks/use-media-query"
import { formatNaira } from "@/lib/utils"
import { getProductForCart } from "@/lib/actions/catalog"

export function WishlistDrawer() {
  const items = useWishlist((s) => s.items)
  const open = useWishlist((s) => s.open)
  const setOpen = useWishlist((s) => s.setOpen)
  const remove = useWishlist((s) => s.remove)
  const add = useCart((s) => s.add)
  const router = useRouter()
  const isDesktop = useIsDesktop()

  async function moveToCart(id: string) {
    const product = await getProductForCart(id)
    if (!product || product.stock < 1) return toast.error("This item is no longer available")
    setOpen(false)
    if (product.option_names.length > 0) {
      toast("Choose your options first")
      router.push(`/products/${product.category}/${product.slug}`)
      return
    }
    add(product)
    remove(id)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen} side={isDesktop ? "right" : "bottom"} title="Wishlist" description={`${items.length} saved ${items.length === 1 ? "item" : "items"}`}>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-14 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-accent/15 text-accent-text"><Heart className="size-7" /></span>
          <div>
            <p className="font-serif text-xl">Nothing saved yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any product to keep it here.</p>
          </div>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 divide-y overflow-y-auto overscroll-contain px-5 pb-safe">
          {items.map((i) => (
            <li key={i.id} className="flex gap-4 py-4">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                <ProductImage src={i.image} alt={i.name} sizes="96px" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${i.category}/${i.slug}`} onClick={() => setOpen(false)}
                  className="line-clamp-1 font-medium hover:underline">{i.name}</Link>
                <p className="text-sm text-muted-foreground">{formatNaira(i.price)}</p>
                <Button size="sm" variant="secondary" className="mt-3" onClick={() => moveToCart(i.id)}>
                  <ShoppingBag /> Move to cart
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="-mr-2 self-start" aria-label={`Remove ${i.name}`} onClick={() => remove(i.id)}><X /></Button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  )
}
