"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/** True only after hydration; use to gate values that come from localStorage. */
export const useMounted = () =>
  useSyncExternalStore(subscribe, () => true, () => false)
