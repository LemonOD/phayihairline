"use client"

import { useState, useTransition } from "react"
import type { ActionResult } from "@/types"

/** Runs a server action inside a transition and tracks its error/success state. */
export function useActionForm<T>() {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  function run(action: () => Promise<ActionResult<T> | void>) {
    setError(null)
    start(async () => {
      const res = await action()
      if (res && !res.ok) setError(res.error)
      if (res && res.ok) setData((res.data as T) ?? null)
    })
  }

  return { pending, error, data, run }
}
