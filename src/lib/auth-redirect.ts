/**
 * Where a signed-in user belongs. Admins land on the dashboard, everyone else on their account.
 * Kept free of server-only imports so the proxy (middleware), route handlers and server actions can share it.
 */
export const homeFor = (role?: string | null) => (role === "admin" ? "/admin" : "/account")

/** A same-site path from a `?next=` parameter, or `null` (never an open redirect to another origin). */
export const explicitNext = (next?: string | null) =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : null
