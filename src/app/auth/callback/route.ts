import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { explicitNext, homeFor } from "@/lib/auth-redirect"
import { emailWelcome } from "@/lib/notify"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const wanted = explicitNext(searchParams.get("next"))

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
      if (wanted) return NextResponse.redirect(`${origin}${wanted}`)
      const { data: profile } = u ? await supabase.from("profiles").select("role").eq("id", u.id).maybeSingle() : { data: null }
      return NextResponse.redirect(`${origin}${homeFor(profile?.role)}`)
    }
  }
  return NextResponse.redirect(`${origin}/login?error=link-expired`)
}
