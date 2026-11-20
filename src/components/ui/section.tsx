import { cn } from "@/lib/utils"

export const Container = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />
)

export function SectionHeading({ eyebrow, title, description, className }: {
  eyebrow?: string; title: string; description?: string; className?: string
}) {
  return (
    <div className={cn("mx-auto mb-10 max-w-2xl text-center", className)}>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-muted-foreground">{description}</p>}
    </div>
  )
}
