import * as React from "react"
import { cn } from "@/lib/utils"

const field = [
  "w-full rounded-md border bg-card px-3 text-sm transition-colors placeholder:text-muted-foreground",
  "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
  "disabled:opacity-50 aria-[invalid=true]:border-destructive",
].join(" ")

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(field, "h-10", className)} {...props} />
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(field, "min-h-24 py-2", className)} {...props} />
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(field, "h-10 appearance-none pr-8", className)} {...props} />
}
