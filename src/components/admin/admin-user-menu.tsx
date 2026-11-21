"use client"

import Link from "next/link"
import { useTransition } from "react"
import * as Menu from "@radix-ui/react-dropdown-menu"
import { ChevronsUpDown, ExternalLink, LogOut } from "lucide-react"
import { signOut } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/auth"

const item = "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm outline-none data-[highlighted]:bg-muted"

/**
 * Account menu for the admin area: who is signed in, a way back to the store, and sign out.
 * `row` is the sidebar footer (avatar + name); `avatar` is the compact phone/tablet top bar.
 */
export function AdminUserMenu({ name, email, variant = "avatar" }: { name: string; email: string; variant?: "avatar" | "row" }) {
  const [, start] = useTransition()
  const initial = (name || email).trim().charAt(0).toUpperCase() || "A"
  const badge = "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        {variant === "row" ? (
          <button type="button" aria-label="Account menu"
            className="flex w-full min-h-12 items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-muted data-[state=open]:bg-muted">
            <span className={badge}>{initial}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{name}</span>
              <span className="block truncate text-xs text-muted-foreground">{email}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        ) : (
          <button type="button" aria-label="Account menu" className={cn(badge, "size-10 transition active:scale-95")}>{initial}</button>
        )}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align={variant === "row" ? "start" : "end"} side={variant === "row" ? "top" : "bottom"} sideOffset={8}
          className="z-50 min-w-56 rounded-lg border bg-card p-1.5 shadow-lg">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <Menu.Separator className="my-1 h-px bg-border" />
          <Menu.Item asChild>
            <Link href="/" target="_blank" rel="noopener noreferrer" className={item}>
              <ExternalLink className="size-4 text-muted-foreground" aria-hidden /> View store
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </Menu.Item>
          {/* Not a <form>: Radix closes the menu on select, which unmounts a form before it can submit. */}
          <Menu.Item className={item} onSelect={() => {
            useAuth.setState({ status: "anon" }, true)
            start(() => signOut())
          }}>
            <LogOut className="size-4 text-muted-foreground" aria-hidden /> Sign out
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
