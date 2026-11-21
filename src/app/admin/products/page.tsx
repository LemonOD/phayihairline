import Link from "next/link"
import { Plus } from "lucide-react"
import { DeleteProductButton } from "@/components/admin/delete-product-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductImage } from "@/components/ui/product-image"
import { getAdminProducts } from "@/lib/data/admin"
import { formatNaira } from "@/lib/utils"

export const metadata = { title: "Products" }

export default async function AdminProducts() {
  const products = await getAdminProducts()
  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">Products</h1>
        <Button asChild><Link href="/admin/products/new"><Plus /> New product</Link></Button>
      </div>
      <Card className="divide-y">
        {products.length === 0 && <p className="p-6 text-muted-foreground">No products yet.</p>}
        {products.map((p) => (
          <div key={p.id} className="relative flex items-start gap-3 p-3 transition-colors hover:bg-muted/40 sm:items-center sm:gap-4 sm:p-4">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-16"><ProductImage src={p.images[0]} alt="" sizes="64px" /></div>
            <div className="min-w-0 flex-1">
              {/* Stretched link: the whole row opens the product. */}
              <Link href={`/admin/products/${p.id}`} className="line-clamp-2 font-medium leading-snug after:absolute after:inset-0 hover:underline">{p.name}</Link>
              <p className="mt-0.5 text-sm text-muted-foreground"><span className="capitalize">{p.category}</span> · {formatNaira(p.price)} · {p.stock} in stock</p>
              {(!p.is_active || p.is_featured) && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {!p.is_active && <Badge variant="muted">Hidden</Badge>}
                  {p.is_featured && <Badge variant="accent">Featured</Badge>}
                </div>
              )}
            </div>
            <div className="relative z-10 -mr-1 sm:mr-0"><DeleteProductButton id={p.id} name={p.name} /></div>
          </div>
        ))}
      </Card>
    </>
  )
}
