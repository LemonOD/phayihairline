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
import { formatNaira } from "@/lib/utils"
import { getProductForCart } from "@/lib/actions/catalog"

export function WishlistDrawer() {
  const { items, open, setOpen, remove } = useWishlist()
  const add = useCart((s) => s.add)
  const router = useRouter()

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
    <Sheet open={open} onOpenChange={setOpen} title="Wishlist" description={`${items.length} saved item(s)`}>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <Heart className="size-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Tap the heart on any product to save it here.</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-4 overflow-y-auto p-5">
          {items.map((i) => (
            <li key={i.id} className="flex gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                <ProductImage src={i.image} alt={i.name} sizes="80px" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${i.category}/${i.slug}`} onClick={() => setOpen(false)}
                  className="line-clamp-1 font-medium hover:underline">{i.name}</Link>
                <p className="text-sm text-muted-foreground">{formatNaira(i.price)}</p>
                <Button size="sm" variant="secondary" className="mt-2" onClick={() => moveToCart(i.id)}>
                  <ShoppingBag /> Move to cart
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="size-7" aria-label={`Remove ${i.name}`} onClick={() => remove(i.id)}><X /></Button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  )
}
