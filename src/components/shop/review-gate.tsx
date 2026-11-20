"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Lock } from "lucide-react"
import { ReviewForm } from "./review-form"
import { useAuth } from "@/stores/auth"
import type { OrderStatus } from "@/types"

type Eligibility = "checking" | "ok" | "not-purchased" | "reviewed"

const BUYER_STATUSES: OrderStatus[] = ["confirmed", "shipped", "delivered"]

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      <Lock className="mt-0.5 size-4 shrink-0" /> <span>{children}</span>
    </p>
  )
}

/**
 * Resolves review eligibility in the browser (under the user's own RLS) so the product page
 * itself stays static. UX hint only: submit_review() re-checks everything in Postgres.
 */
export function ReviewGate({ productId }: { productId: string }) {
  const auth = useAuth()
  const userId = auth.status === "user" ? auth.id : null
  const [result, setResult] = useState<{ userId: string; value: Eligibility } | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    // Imported on demand: only signed-in shoppers need the Supabase client on a product page.
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient()
      return Promise.all([
        supabase.from("reviews").select("id").eq("product_id", productId).eq("user_id", userId).maybeSingle(),
        supabase.from("orders").select("id").in("status", BUYER_STATUSES)
          .contains("items", [{ product_id: productId }]).limit(1),
      ])
    }).then(([mine, orders]) => {
      if (cancelled) return
      const value: Eligibility = mine.data ? "reviewed" : orders.data?.length ? "ok" : "not-purchased"
      setResult({ userId, value })
    })
    return () => { cancelled = true }
  }, [productId, userId])

  if (auth.status === "loading") return <div className="h-16 animate-pulse rounded-lg bg-muted" />
  if (auth.status === "anon") {
    return <Note>Only verified buyers can review. <Link href="/login" className="underline underline-offset-2">Sign in</Link> to continue.</Note>
  }

  const value = result?.userId === userId ? result.value : "checking"
  if (value === "checking") return <div className="h-16 animate-pulse rounded-lg bg-muted" />
  if (value === "ok") return <ReviewForm productId={productId} />
  if (value === "reviewed") return <Note>Thanks, you&apos;ve already reviewed this product.</Note>
  return <Note>Only customers who bought this product can review it. Reviews unlock once your order is confirmed.</Note>
}
