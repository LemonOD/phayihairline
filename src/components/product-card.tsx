"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Heart } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { AnimatedGradientBorder } from "@/src/components/ui-enhancements/animated-gradient-border"
import type { Product } from "@/src/lib/types"
import { useCart } from "@/src/lib/context/cart-context"
import { useWishlist } from "@/src/lib/context/wishlist-context"
import { useToast } from "@/src/hooks/use-toast"

export default function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart(product, 1)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist(product)
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    }
  }

  return (
    <AnimatedGradientBorder>
      <div
        className="group bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/products/${product.category}/${product.id}`}>
          <div className="relative h-64 overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
            />
            {product.discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {product.discount}% OFF
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full ${isInWishlist(product.id) ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-primary"}`}
              onClick={handleToggleWishlist}
            >
              <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
              <span className="sr-only">Add to wishlist</span>
            </Button>
          </div>
        </Link>
        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs text-muted-foreground uppercase">{product.category}</span>
          </div>
          <Link href={`/products/${product.category}/${product.id}`}>
            <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
          </Link>
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">₦{product.price.toLocaleString()}</span>
              {product.originalPrice > 0 && (
                <span className="text-muted-foreground line-through text-sm">
                  ₦{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <Button className="w-full gap-2" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </div>
    </AnimatedGradientBorder>
  )
}

