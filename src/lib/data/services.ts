import { createPublicClient } from "@/lib/supabase/server"
import type { Service } from "@/types"

export async function getServices(): Promise<Service[]> {
  const { data } = await createPublicClient()
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
  return (data as Service[]) ?? []
}
