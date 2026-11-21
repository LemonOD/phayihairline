import { SiteShell } from "@/components/layout/site-shell"

/** Everything customers browse. Sign-in pages and the admin area deliberately live outside this frame. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
