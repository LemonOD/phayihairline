"use client"

import type React from "react"
import type { Product } from "@/src/lib/firebase/products"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { useCart } from "@/src/lib/context/cart-context"
import { useWishlist } from "@/src/lib/context/wishlist-context"
import { useToast } from "@/src/hooks/use-toast"
import { formatCurrency } from "@/src/lib/utils"
import { AnimatedGradientBorder } from "@/src/components/ui/animated-gradient-border"

export function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist()
  const { toast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart(product)
    toast({
      title: "Added to cart",
      description: `${product?.name} has been added to your cart.`,
    })
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()

    if (isInWishlist(product?.id)) {
      removeFromWishlist(product?.id)
      toast({
        title: "Removed from wishlist",
        description: `${product?.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist(product)
      toast({
        title: "Added to wishlist",
        description: `${product?.name} has been added to your wishlist.`,
      })
    }
  }

  return (
      <AnimatedGradientBorder showBorder={false}>
        <Link
            href={`/products/${product?.category.toLowerCase()}/${product?.id}`}
            className="group block h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted/50">
            <Image
                src={product?.image || "/placeholder.svg?height=400&width=400"}
                alt={product?.name}
                fill
                className={`object-cover transition-transform duration-300 ${isHovered ? "scale-105" : "scale-100"}`}
            />

            {product?.discount > 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                  {product?.discount}% OFF
                </div>
            )}

            <div
                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0"
                }`}
            >
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddToCart} className="rounded-full">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 hover:bg-background rounded-full"
                onClick={handleWishlistToggle}
            >
              <Heart className={`h-4 w-4 ${isInWishlist(product?.id) ? "fill-red-500 text-red-500" : ""}`} />
              <span className="sr-only">{isInWishlist(product?.id) ? "Remove from wishlist" : "Add to wishlist"}</span>
            </Button>
          </div>

          <div className="p-4 bg-card rounded-b-lg">
            <h3 className="font-medium line-clamp-1">{product?.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{product?.category}</p>
            <div className="flex items-center">
              <span className="font-bold">{formatCurrency(product?.price)}</span>
              {product?.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through ml-2">
                {formatCurrency(product?.originalPrice)}
              </span>
              )}
            </div>
          </div>
        </Link>
      </AnimatedGradientBorder>
  )
}
