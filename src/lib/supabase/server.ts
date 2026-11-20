import { createServerClient } from "@supabase/ssr"
import { createClient as createJsClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"

const DB_TIMEOUT_MS = 10_000

/**
 * A database call that hangs would otherwise hold the visitor on a blank page for a minute or more.
 * Fail fast instead, so the error page (with its retry) shows within seconds.
 */
const fetchWithTimeout: typeof fetch = (input, init) => {
  const timeout = AbortSignal.timeout(DB_TIMEOUT_MS)
  return fetch(input, { ...init, signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout })
}

/** Cookie-aware client: use in server actions, route handlers and authed pages. */
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: fetchWithTimeout },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Called from a Server Component; middleware refreshes the session instead.
          }
        },
      },
    },
  )
}

/** Cookie-free client for public catalog reads, so pages can be cached/ISR'd. */
export const createPublicClient = () =>
  createJsClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchWithTimeout },
  })
