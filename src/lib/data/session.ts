import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types"

/** Per-request memoised current user + profile. Safe to call from many components. */
export const getSession = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return { user: null, profile: null }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("id", data.user.id)
    .maybeSingle()

  return { user: data.user, profile: (profile as Profile | null) ?? null }
})

export async function requireAdmin() {
  const session = await getSession()
  if (session.profile?.role !== "admin") throw new Error("Not authorised")
  return session
}
