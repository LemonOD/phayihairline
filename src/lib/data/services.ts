import { createPublicClient } from "@/lib/supabase/server"
import { unwrap } from "@/lib/data/unwrap"
import type { Service } from "@/types"

export async function getServices(): Promise<Service[]> {
  return unwrap(
    await createPublicClient().from("services").select("*").eq("is_active", true).order("sort_order"),
    [] as Service[],
  )
}
