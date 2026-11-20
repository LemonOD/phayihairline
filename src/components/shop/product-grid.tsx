import { Stagger, StaggerItem } from "@/components/ui/motion"
import { ProductCard } from "./product-card"
import type { Product } from "@/types"

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <StaggerItem key={p.id}><ProductCard product={p} /></StaggerItem>
      ))}
    </Stagger>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="aspect-[4/6] animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  )
}
