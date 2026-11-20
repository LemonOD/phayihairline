import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { emailWelcome } from "@/lib/notify"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/account"
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/account"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Welcome only on first email confirmation: not on password-reset links (they carry ?next=) or later sign-ins.
      const { data } = await supabase.auth.getUser()
      const u = data.user
      const confirmedAgo = u?.email_confirmed_at ? Date.now() - new Date(u.email_confirmed_at).getTime() : Infinity
      if (u?.email && !searchParams.get("next") && confirmedAgo < 5 * 60_000) {
        await emailWelcome({ email: u.email, name: u.user_metadata?.full_name })
      }
      return NextResponse.redirect(`${origin}${safe}`)
    }
  }
  return NextResponse.redirect(`${origin}/login?error=link-expired`)
}
