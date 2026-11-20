import { cn } from "@/lib/utils"

export const Card = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("rounded-lg border bg-card", className)} {...props} />
)
