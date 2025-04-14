"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/src/lib/firebase/products"

type WishlistItem = {
  id: string
  name: string
  price: number
  image?: string
  category: string
  description?: string
  originalPrice?: number | null
  discount?: number
  images?: string[]
  features?: string[]
  stock?: number
  rating?: number
  reviews?: number
  tags?: string[]
}

type WishlistContextType = {
  wishlist: WishlistItem[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
  clearWishlist: () => {},
})

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])

  // Load wishlist from localStorage on initial render
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist))
      } catch (error) {
        console.error("Failed to parse wishlist from localStorage:", error)
      }
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist))
  }, [wishlist])

  const addToWishlist = (product: Product) => {
    setWishlist((prevWishlist) => {
      // Check if product already exists in wishlist
      const existingItem = prevWishlist.find((item) => item.id === product.id)

      if (existingItem) {
        // If product exists, don't add it again
        return prevWishlist
      } else {
        // If product doesn't exist, add it
        return [
          ...prevWishlist,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            description: product.description,
            originalPrice: product.originalPrice,
            discount: product.discount,
            images: product.images,
            features: product.features,
            stock: product.stock,
            rating: product.rating,
            reviews: product.reviews,
            tags: product.tags,
          },
        ]
      }
    })
  }

  const removeFromWishlist = (productId: string) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== productId))
  }

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId)
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  return (
      <WishlistContext.Provider
          value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            clearWishlist,
          }}
      >
        {children}
      </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}

