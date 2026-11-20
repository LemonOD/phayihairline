import { ProductForm } from "@/components/admin/product-form"
import { getCategories } from "@/lib/data/catalog"

export const metadata = { title: "New product" }

export default async function NewProduct() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold">New product</h1>
      <ProductForm categories={await getCategories()} />
    </>
  )
}
