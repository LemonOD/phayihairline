import { getProductBySlug } from "@/lib/data/catalog"
import { ogImage, ogSize } from "@/lib/og"
import { formatNaira } from "@/lib/utils"

export const alt = "Product preview"
export const size = ogSize
export const contentType = "image/png"
export const revalidate = 3600

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug)
  return ogImage({
    eyebrow: product?.category ?? "PhayiHairline",
    title: product?.name ?? "PhayiHairline",
    subtitle: product ? `From ${formatNaira(product.price)}` : undefined,
    image: product?.images[0],
  })
}
