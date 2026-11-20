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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Products</h1>
        <Button asChild><Link href="/admin/products/new"><Plus /> New product</Link></Button>
      </div>
      <Card className="divide-y">
        {products.length === 0 && <p className="p-6 text-muted-foreground">No products yet.</p>}
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted"><ProductImage src={p.images[0]} alt={p.name} sizes="56px" /></div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/products/${p.id}`} className="line-clamp-1 font-medium hover:underline">{p.name}</Link>
              <p className="text-sm text-muted-foreground capitalize">{p.category} · {formatNaira(p.price)} · {p.stock} in stock</p>
            </div>
            {!p.is_active && <Badge variant="muted">Hidden</Badge>}
            {p.is_featured && <Badge variant="accent">Featured</Badge>}
            <DeleteProductButton id={p.id} name={p.name} />
          </div>
        ))}
      </Card>
    </>
  )
}
