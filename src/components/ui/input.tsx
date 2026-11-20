import * as React from "react"
import { cn } from "@/lib/utils"

const field = [
  "w-full rounded-md border bg-card px-3.5 text-base transition-colors placeholder:text-muted-foreground md:px-3 md:text-sm",
  "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
  "disabled:opacity-50 aria-[invalid=true]:border-destructive",
].join(" ")

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(field, "h-12 md:h-10", className)} {...props} />
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(field, "min-h-28 py-3 md:min-h-24 md:py-2", className)} {...props} />
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(field, "h-12 appearance-none pr-8 md:h-10", className)} {...props} />
}
