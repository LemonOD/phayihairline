"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/stores/auth"

/** Supabase stores the session in `sb-<project>-auth-token` cookies (chunked as `.0`, `.1` when large). */
const hasAuthCookie = () => document.cookie.split("; ").some((c) => /^sb-[^=]*-auth-token/.test(c))

/**
 * Keeps the auth store in sync with the Supabase session. Mount once (in Providers).
 * Re-checks on navigation because server actions (sign in/out) change cookies without a full reload.
 *
 * The Supabase client is ~65 KB gzipped, so it is imported on demand: visitors without a session
 * cookie (most shoppers) never download it.
 */
export function useAuthSync() {
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined

    async function load() {
      if (!hasAuthCookie()) {
        if (useAuth.getState().status !== "anon") useAuth.setState({ status: "anon" }, true)
        return
      }

      const { createClient } = await import("@/lib/supabase/client")
      if (cancelled) return
      const supabase = createClient()

      if (!unsubscribe) {
        const { data: sub } = supabase.auth.onAuthStateChange(() => { void load() })
        unsubscribe = () => sub.subscription.unsubscribe()
      }

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

    void load()
    return () => { cancelled = true; unsubscribe?.() }
  }, [pathname])
}
