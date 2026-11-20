"use server"

import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { emailBookingStatus } from "@/lib/notify"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/data/session"
import { productSchema, serviceSchema, type ProductInput } from "@/lib/validation/schemas"
import { slugify } from "@/lib/utils"
import { fail, validationError } from "./helpers"
import type { ActionResult, BookingStatus, OrderStatus } from "@/types"

function refreshCatalog() {
  revalidatePath("/", "layout")
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

  let productId = id
  if (id) {
    const { error } = await supabase.from("products").update(values).eq("id", id)
    if (error) return fail(error.message)
  } else {
    const slug = `${slugify(values.name)}-${Math.random().toString(36).slice(2, 6)}`
    const { data, error } = await supabase.from("products").insert({ ...values, slug }).select("id").single()
    if (error || !data) return fail(error?.message ?? "Could not create product")
    productId = data.id
  }

  const variantError = await saveVariants(supabase, productId!, variants)
  if (variantError) return fail(`Product saved, but variants failed: ${variantError}`)

  refreshCatalog()
  return { ok: true, data: { id: productId! } }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) return fail(error.message)
  refreshCatalog()
  return { ok: true }
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("orders").update({ status }).eq("id", id)
  if (error) return fail(error.message)
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
    .single()
  if (error) return fail(error.message)

  const customerEmail = data.customer_email as string | null
  if ((status === "confirmed" || status === "cancelled") && customerEmail) {
    const service = (data.service as unknown as { name: string } | null)?.name ?? "appointment"
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
  const { error } = id
    ? await supabase.from("services").update(parsed.data).eq("id", id)
    : await supabase.from("services").insert({
        ...parsed.data,
        slug: `${slugify(parsed.data.name)}-${Math.random().toString(36).slice(2, 6)}`,
      })
  if (error) return fail(error.message)

  revalidatePath("/services")
  revalidatePath("/book")
  return { ok: true }
}

export async function deleteService(id: string): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("services").delete().eq("id", id)
  if (error?.code === "23503") return fail("This service has bookings. Hide it instead of deleting it.")
  if (error) return fail(error.message)
  revalidatePath("/services")
  return { ok: true }
}
