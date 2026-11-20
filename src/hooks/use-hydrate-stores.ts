"use client"

import { useEffect } from "react"
import { useCart } from "@/stores/cart"
import { useWishlist } from "@/stores/wishlist"

/** Persisted stores skip SSR hydration to avoid mismatches; rehydrate once on the client. */
export function useHydrateStores() {
  useEffect(() => {
    useCart.persist.rehydrate()
    useWishlist.persist.rehydrate()
  }, [])
}
