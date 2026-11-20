"use client"

import { useEffect } from "react"
import { useAuth } from "@/stores/auth"

type Prefill = { name: string; phone: string; email: string }

/** Calls `fill` once with the signed-in user's details (never overwrites what they've typed). */
export function usePrefill(fill: (profile: Prefill) => void) {
  const auth = useAuth()
  const userId = auth.status === "user" ? auth.id : null
  const profile = auth.status === "user" ? { name: auth.name, phone: auth.phone, email: auth.email } : null

  useEffect(() => {
    if (userId && profile) fill(profile)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per signed-in user
  }, [userId])
}
