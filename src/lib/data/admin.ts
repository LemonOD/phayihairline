import { createClient } from "@/lib/supabase/server"
import { unwrap } from "@/lib/data/unwrap"
import { toOrder } from "@/lib/orders"
import type { Database } from "@/types/database"
import type { Booking, Order, Product, Service } from "@/types"

export async function getAdminProducts(): Promise<Product[]> {
  const supabase = await createClient()
  return unwrap(await supabase.from("products").select("*").order("created_at", { ascending: false }), [])
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()
  return unwrap(
    await supabase
      .from("products")
      .select("*, variants:product_variants(*)")
      .eq("id", id)
      .order("sort_order", { referencedTable: "product_variants" })
      .maybeSingle(),
    null,
  )
}

export async function getAdminServices(): Promise<Service[]> {
  const supabase = await createClient()
  return unwrap(await supabase.from("services").select("*").order("sort_order"), [])
}

export async function getAdminService(id: string): Promise<Service | null> {
  const supabase = await createClient()
  return unwrap(await supabase.from("services").select("*").eq("id", id).maybeSingle(), null)
}

export async function getAdminOrders(): Promise<Order[]> {
  const supabase = await createClient()
  return unwrap(
    await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
    [],
  ).map(toOrder)
}

export async function getAdminBookings(): Promise<Booking[]> {
  const supabase = await createClient()
  return unwrap(
    await supabase
      .from("bookings")
      .select("*, service:services(name, duration_minutes, price)")
      .order("starts_at", { ascending: true })
      .limit(100),
    [],
  )
}

/** The next appointments that are still on (pending or confirmed), soonest first. */
export async function getUpcomingBookings(limit = 5): Promise<Booking[]> {
  const supabase = await createClient()
  return unwrap(
    await supabase
      .from("bookings")
      .select("*, service:services(name, duration_minutes, price)")
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(limit),
    [],
  )
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const count = (table: keyof Database["public"]["Tables"], filter?: [string, string]) => {
    const q = supabase.from(table).select("*", { count: "exact", head: true })
    return (filter ? q.eq(filter[0], filter[1]) : q).then((r) => {
      if (r.error) throw new Error(`Database query failed: ${r.error.message}`, { cause: r.error })
      return r.count ?? 0
    })
  }
  const [products, pendingOrders, pendingBookings, messages] = await Promise.all([
    count("products"),
    count("orders", ["status", "pending"]),
    count("bookings", ["status", "pending"]),
    count("contact_messages"),
  ])
  return { products, pendingOrders, pendingBookings, messages }
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  created_at: string
}

export async function getAdminMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient()
  return unwrap(
    await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100),
    [],
  )
}
