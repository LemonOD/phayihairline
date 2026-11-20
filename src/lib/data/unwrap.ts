import type { PostgrestError } from "@supabase/supabase-js"

/**
 * Returns a query's data, or throws when the query itself failed.
 *
 * Swallowing errors as "no rows" makes an outage look like an empty shop, and on ISR pages that
 * empty result gets cached. Throwing lets Next keep serving the last good page and lets
 * `error.tsx` show a retry instead. During `next build` we fall back, so CI can build with a
 * placeholder Supabase project.
 */
export function unwrap<T>(
  res: { data: T; error: null } | { data: null; error: PostgrestError },
  fallback: NoInfer<T>,
): T {
  if (res.error) {
    if (process.env.NEXT_PHASE === "phase-production-build") return fallback
    throw new Error(`Database query failed: ${res.error.message}`, { cause: res.error })
  }
  return res.data
}
