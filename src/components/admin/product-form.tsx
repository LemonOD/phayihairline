"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input, Select, Textarea } from "@/components/ui/input"
import { ImageUploader } from "./image-uploader"
import { VariantEditor, type VariantRow } from "./variant-editor"
import { saveProduct } from "@/lib/actions/admin"
import type { Category, Product } from "@/types"

type Values = {
  name: string; description: string; price: string; compare_at_price: string; category: string
  stock: string; features: string; tags: string; images: string[]; is_featured: boolean; is_active: boolean
  option_names: string[]; variants: VariantRow[]
}

const lines = (s: string) => s.split("\n").map((v) => v.trim()).filter(Boolean)
const commas = (s: string) => s.split(",").map((v) => v.trim()).filter(Boolean)

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const { register, control, handleSubmit } = useForm<Values>({
    defaultValues: {
      name: product?.name ?? "", description: product?.description ?? "",
      price: String(product?.price ?? ""), compare_at_price: String(product?.compare_at_price ?? ""),
      category: product?.category ?? categories[0]?.slug ?? "", stock: String(product?.stock ?? 0),
      features: product?.features.join("\n") ?? "", tags: product?.tags.join(", ") ?? "",
      images: product?.images ?? [], is_featured: product?.is_featured ?? false, is_active: product?.is_active ?? true,
      option_names: product?.option_names ?? [],
      variants: (product?.variants ?? []).map((v) => ({
        id: v.id, options: v.options, price: String(v.price),
        compare_at_price: String(v.compare_at_price ?? ""), stock: String(v.stock),
      })),
    },
  })

  const basePrice = useWatch({ control, name: "price" })

  const onSubmit = (v: Values) =>
    start(async () => {
      const res = await saveProduct(product?.id ?? null, {
        ...v,
        compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
        features: lines(v.features),
        tags: commas(v.tags),
        variants: v.variants.map((r) => ({ ...r, compare_at_price: r.compare_at_price ? Number(r.compare_at_price) : null })),
      })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success("Product saved")
      router.push("/admin/products")
      router.refresh()
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <Field label="Name" htmlFor="name"><Input id="name" required {...register("name")} /></Field>
      <Field label="Description" htmlFor="description"><Textarea id="description" rows={4} {...register("description")} /></Field>

      <div className="grid gap-5 sm:grid-cols-4">
        <Field label="Price (₦)" htmlFor="price" hint="With variants, this becomes the lowest variant price"><Input id="price" type="number" min={0} required {...register("price")} /></Field>
        <Field label="Compare-at (₦)" htmlFor="compare" hint="Original price"><Input id="compare" type="number" min={0} {...register("compare_at_price")} /></Field>
        <Field label="Stock" htmlFor="stock"><Input id="stock" type="number" min={0} required {...register("stock")} /></Field>
        <Field label="Category" htmlFor="category">
          <Select id="category" {...register("category")}>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </Select>
        </Field>
      </div>

      <Controller control={control} name="variants" render={({ field: rows }) => (
        <Controller control={control} name="option_names" render={({ field: names }) => (
          <VariantEditor optionNames={names.value} onOptionNames={names.onChange}
            rows={rows.value} onRows={rows.onChange} basePrice={basePrice} />
        )} />
      )} />

      <Field label="Features" htmlFor="features" hint="One per line"><Textarea id="features" rows={4} {...register("features")} /></Field>
      <Field label="Tags" htmlFor="tags" hint="Comma separated"><Input id="tags" {...register("tags")} /></Field>

      <div className="space-y-1.5">
        <p className="text-sm font-medium">Images</p>
        <Controller control={control} name="images" render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[var(--accent)]" {...register("is_featured")} /> Featured on home page</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[var(--accent)]" {...register("is_active")} /> Visible in shop</label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={pending}>Save product</Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
