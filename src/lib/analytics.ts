import { track as vercelTrack } from "@vercel/analytics"

/**
 * Funnel events. Props are primitives only and never contain personal data.
 * To switch provider (PostHog, Plausible…), change the body of `track` — call sites stay the same.
 */
type Events = {
  add_to_cart: { product: string; value: number }
  begin_checkout: { items: number; value: number }
  order_placed: { items: number; value: number }
  booking_created: { service: string }
  review_submitted: { rating: number }
  whatsapp_click: { from: string }
}

export function track<E extends keyof Events>(event: E, props: Events[E]) {
  try {
    vercelTrack(event, props)
  } catch {
    // Analytics must never break the UI (ad blockers, offline…).
  }
}
