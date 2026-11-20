import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      accent: "bg-accent text-accent-foreground",
      muted: "bg-muted text-muted-foreground",
      success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
      warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
      danger: "bg-destructive/15 text-destructive",
    },
  },
  defaultVariants: { variant: "default" },
})

export function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
