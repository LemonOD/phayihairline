"use server"

import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { emailBookingStatus } from "@/lib/notify"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/data/session"
import { productSchema, serviceSchema, type ProductInput } from "@/lib/validation/schemas"
import { slugify } from "@/lib/utils"
import { fail, isMissingFunction, missing, validationError } from "./helpers"
import type { ActionResult, BookingStatus, OrderStatus } from "@/types"

/** Pages that render catalog data. Targeted on purpose: the header, footer and account pages don't need a rebuild. */
function refreshCatalog() {
  revalidatePath("/")
  revalidatePath("/products/[category]", "page")
  revalidatePath("/products/[category]/[slug]", "page")
  revalidatePath("/sitemap.xml")
}

async function saveVariants(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  variants: ProductInput["variants"],
): Promise<string | null> {
  const keepIds = variants.flatMap((v) => (v.id ? [v.id] : []))
  const existing = await supabase.from("product_variants").select("id").eq("product_id", productId)
  const stale = (existing.data ?? []).map((r) => r.id as string).filter((id) => !keepIds.includes(id))
  if (stale.length) {
    const { error } = await supabase.from("product_variants").delete().in("id", stale)
    if (error) return error.message
  }
  if (!variants.length) return null

  const rows = variants.map((v, i) => ({
    ...(v.id ? { id: v.id } : {}),
    product_id: productId,
    options: v.options,
    price: v.price,
    compare_at_price: v.compare_at_price || null,
    stock: v.stock,
    sort_order: i,
  }))
  const { error } = await supabase.from("product_variants").upsert(rows)
  return error?.message ?? null
}

const newSlug = (name: string) => `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`

export async function saveProduct(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin()
  const parsed = productSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const supabase = await createClient()
  const { variants, ...rest } = parsed.data
  const values = {
    ...rest,
    compare_at_price: rest.compare_at_price || null,
    option_names: variants.length ? rest.option_names : [],
  }

  // Preferred: one transaction for the product and its variants (migration 0006).
  const { data: savedId, error: rpcError } = await supabase.rpc("save_product", {
    p_id: id,
    p_product: { ...values, ...(id ? {} : { slug: newSlug(values.name) }) },
    p_variants: variants.map((v) => ({ ...v, compare_at_price: v.compare_at_price || null })),
  })
  if (!rpcError && savedId) {
    refreshCatalog()
    return { ok: true, data: { id: savedId } }
  }
  if (!isMissingFunction(rpcError)) return fail(rpcError?.message ?? "Could not save the product")

  // Fallback while the migration is not applied: the old multi-step save.
  let productId: string
  if (id) {
    const { data, error } = await supabase.from("products").update(values).eq("id", id).select("id")
    if (error) return fail(error.message)
    if (!data.length) return missing("Product")
    productId = id
  } else {
    const { data, error } = await supabase.from("products").insert({ ...values, slug: newSlug(values.name) }).select("id").single()
    if (error || !data) return fail(error?.message ?? "Could not create product")
    productId = data.id
  }

  const variantError = await saveVariants(supabase, productId, variants)
  if (variantError) return fail(`Product saved, but variants failed: ${variantError}`)

  refreshCatalog()
  return { ok: true, data: { id: productId } }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").delete().eq("id", id).select("id")
  if (error) return fail(error.message)
  if (!data.length) return missing("Product")
  refreshCatalog()
  return { ok: true }
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select("id")
  if (error) return fail(error.message)
  if (!data.length) return missing("Order")
  revalidatePath("/admin/orders")
  return { ok: true }
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select("customer_name, customer_email, starts_at, service:services(name)")
    .maybeSingle()
  if (error) return fail(error.message)
  if (!data) return missing("Booking")

  const customerEmail = data.customer_email
  if ((status === "confirmed" || status === "cancelled") && customerEmail) {
    const service = data.service?.name ?? "appointment"
    after(() => emailBookingStatus({
      email: customerEmail, name: data.customer_name, service, status,
      when: new Intl.DateTimeFormat("en-NG", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(data.starts_at)),
    }))
  }
  revalidatePath("/admin/bookings")
  return { ok: true }
}

export async function saveService(id: string | null, input: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = serviceSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const supabase = await createClient()
  if (id) {
    const { data, error } = await supabase.from("services").update(parsed.data).eq("id", id).select("id")
    if (error) return fail(error.message)
    if (!data.length) return missing("Service")
  } else {
    const { error } = await supabase.from("services").insert({ ...parsed.data, slug: newSlug(parsed.data.name) })
    if (error) return fail(error.message)
  }

  revalidatePath("/services")
  revalidatePath("/book")
  return { ok: true }
}

export async function deleteService(id: string): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase.from("services").delete().eq("id", id).select("id")
  if (error?.code === "23503") return fail("This service has bookings. Hide it instead of deleting it.")
  if (error) return fail(error.message)
  if (!data.length) return missing("Service")
  revalidatePath("/services")
  return { ok: true }
}
