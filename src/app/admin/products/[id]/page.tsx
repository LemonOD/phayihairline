import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"
import { getAdminProduct } from "@/lib/data/admin"
import { getCategories } from "@/lib/data/catalog"

export const metadata = { title: "Edit product" }

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([getAdminProduct(id), getCategories()])
  if (!product) notFound()

  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold">Edit product</h1>
      <ProductForm product={product} categories={categories} />
    </>
  )
}
