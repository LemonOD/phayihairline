import { createClient } from "@/lib/supabase/server"
import type { Booking, Order } from "@/types"

export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false })
  return (data as Order[]) ?? []
}

export async function getMyBookings(): Promise<Booking[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("bookings")
    .select("*, service:services(name, duration_minutes, price)")
    .order("starts_at", { ascending: false })
  return (data as Booking[]) ?? []
}
