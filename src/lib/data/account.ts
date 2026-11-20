import { createClient } from "@/lib/supabase/server"
import { unwrap } from "@/lib/data/unwrap"
import type { Booking, Order } from "@/types"

export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createClient()
  return unwrap(await supabase.from("orders").select("*").order("created_at", { ascending: false }), [] as Order[])
}

export async function getMyBookings(): Promise<Booking[]> {
  const supabase = await createClient()
  return unwrap(
    await supabase
      .from("bookings")
      .select("*, service:services(name, duration_minutes, price)")
      .order("starts_at", { ascending: false }),
    [] as Booking[],
  )
}
