import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { UpdatePasswordForm } from "@/components/auth/password-forms"

export const metadata: Metadata = { title: "Choose a new password" }

export default function UpdatePasswordPage() {
  return (
    <AuthShell title="Choose a new password">
      <UpdatePasswordForm />
    </AuthShell>
  )
}
