"use client"

import { useState, useTransition } from "react"
import type { ActionResult } from "@/types"

/** Runs a server action inside a transition and tracks its error/success state. */
export function useActionForm<T = void>() {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  function run(action: () => Promise<ActionResult<T> | void>) {
    setError(null)
    start(async () => {
      const res = await action()
      if (!res) return // the action redirected
      if (!res.ok) return setError(res.error)
      if ("data" in res) setData(res.data as T)
    })
  }

  return { pending, error, data, run }
}
