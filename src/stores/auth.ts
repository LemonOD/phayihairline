import { create } from "zustand"

export type AuthState =
  | { status: "loading" }
  | { status: "anon" }
  | { status: "user"; id: string; email: string; name: string; phone: string; isAdmin: boolean }

/** Client-side mirror of the Supabase session, so server layouts stay static and cacheable. */
export const useAuth = create<AuthState>(() => ({ status: "loading" }))
