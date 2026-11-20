"use client"

import { useSyncExternalStore } from "react"

/** Live `matchMedia` result. `false` on the server, so write mobile-first and treat `true` as the enhancement. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query)
      mq.addEventListener("change", notify)
      return () => mq.removeEventListener("change", notify)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const useIsDesktop = () => useMediaQuery("(min-width: 768px)")
