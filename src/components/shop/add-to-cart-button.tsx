"use client"

import { Check, ShoppingBag } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/stores/cart"
import type { ProductSummary } from "@/types"

/** Quick-add for products without options. Products with options link to their page instead. */
export function AddToCartButton({ product, className }: { product: ProductSummary; className?: string }) {
  const add = useCart((s) => s.add)
  const [added, setAdded] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <Button size="sm" className={className} aria-label={`Add ${product.name} to cart`}
      onClick={() => {
        add(product) // the cart opens by itself, so no toast is needed
        setAdded(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setAdded(false), 1600)
      }}>
      {added ? <><Check /> Added</> : (
        <>
          <ShoppingBag />
          {/* Full label when the button spans a narrow card; compact "Add" beside the price in a wide one. */}
          <span className="@min-[16rem]:hidden">Add to cart</span>
          <span className="hidden @min-[16rem]:inline">Add</span>
        </>
      )}
    </Button>
  )
}
