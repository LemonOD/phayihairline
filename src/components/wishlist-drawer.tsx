"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Trash } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet"
import { useWishlist } from "@/src/lib/context/wishlist-context"
import { useCart } from "@/src/lib/context/cart-context"
import { useToast } from "@/src/hooks/use-toast"

export default function WishlistDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { wishlistItems, removeFromWishlist, getWishlistCount } = useWishlist()
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleRemoveItem = (productId: string) => {
    removeFromWishlist(productId)
  }

  const handleAddToCart = (productId: string) => {
    const product = wishlistItems.find((item) => item.id === productId)
    if (product) {
      addToCart(product, 1)
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Heart className="h-5 w-5" />
          <span className="sr-only">Wishlist</span>
          {getWishlistCount() > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {getWishlistCount()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5" />
            Your Wishlist ({getWishlistCount()} items)
          </SheetTitle>
        </SheetHeader>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-center mb-6">
              Save your favorite items to your wishlist for later.
            </p>
            <Button asChild onClick={() => setIsOpen(false)}>
              <Link href="/products/wigs">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.category}/${item.id}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                  <div className="text-sm text-muted-foreground mt-1">₦{item.price.toLocaleString()}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => handleAddToCart(item.id)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" /> Add to Cart
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

