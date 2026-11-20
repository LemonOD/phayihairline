"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/stores/auth"

/**
 * Keeps the auth store in sync with the Supabase session. Mount once (in Providers).
 * Re-checks on navigation because server actions (sign in/out) change cookies without a full reload.
 */
export function useAuthSync() {
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data } = await supabase.auth.getSession() // reads cookie locally, no network
      const user = data.session?.user
      const current = useAuth.getState()
      if (!user) {
        if (current.status !== "anon") useAuth.setState({ status: "anon" }, true)
        return
      }
      if (current.status === "user" && current.id === user.id) return

      const { data: profile } = await supabase
        .from("profiles").select("full_name, phone, role").eq("id", user.id).maybeSingle()
      if (cancelled) return
      useAuth.setState({
        status: "user", id: user.id, email: user.email ?? "",
        name: profile?.full_name ?? user.email ?? "", phone: profile?.phone ?? "",
        isAdmin: profile?.role === "admin",
      }, true)
    }

    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => { load() })
    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [pathname])
}
