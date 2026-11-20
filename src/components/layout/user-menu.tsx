"use client"

import Link from "next/link"
import { useTransition } from "react"
import * as Menu from "@radix-ui/react-dropdown-menu"
import { LayoutDashboard, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions/auth"
import { useAuth } from "@/stores/auth"

const item = "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none data-[highlighted]:bg-muted"

export function UserMenu() {
  const user = useAuth()
  const [, start] = useTransition()
  if (user.status === "loading") return <div className="size-11 md:ml-1 md:h-8 md:w-[74px]" aria-hidden />
  if (user.status === "anon") {
    return (
      <>
        <Button asChild variant="ghost" size="icon" className="md:hidden"><Link href="/login" aria-label="Sign in"><User /></Link></Button>
        <Button asChild size="sm" className="ml-1 hidden md:inline-flex"><Link href="/login">Sign in</Link></Button>
      </>
    )
  }

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account"><User /></Button>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="end" sideOffset={8}
          className="z-50 min-w-48 rounded-md border bg-card p-1 shadow-lg">
          <Menu.Label className="truncate px-2 py-1.5 text-xs text-muted-foreground">{user.name}</Menu.Label>
          <Menu.Item asChild><Link href="/account" className={item}><User className="size-4" /> My account</Link></Menu.Item>
          {user.isAdmin && (
            <Menu.Item asChild><Link href="/admin" className={item}><LayoutDashboard className="size-4" /> Admin</Link></Menu.Item>
          )}
          <Menu.Separator className="my-1 h-px bg-border" />
          {/* Not a <form>: Radix closes the menu on select, which unmounts a form before it can submit. */}
          <Menu.Item className={item} onSelect={() => {
            useAuth.setState({ status: "anon" }, true) // the redirect may not change the path, so don't wait for the sync hook
            start(() => signOut())
          }}>
            <LogOut className="size-4" /> Sign out
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
