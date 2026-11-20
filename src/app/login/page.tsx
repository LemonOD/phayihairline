import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams
  return (
    <AuthShell
      title="Welcome back"
      subtitle={error ? "That link has expired. Please sign in or request a new one." : "Sign in to track orders and bookings."}
      footer={<>New here? <Link href="/register" className="font-medium text-foreground underline">Create an account</Link></>}
    >
      <LoginForm next={next} />
      <Link href="/forgot-password" className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground">
        Forgot your password?
      </Link>
    </AuthShell>
  )
}
