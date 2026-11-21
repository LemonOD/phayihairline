import { cn } from "@/lib/utils"

/**
 * Layout wrappers. They used to animate on scroll, but scroll-linked transforms leave sections that never
 * reach their trigger point (anything near the bottom of a page) permanently shrunk and offset, which looks
 * like broken layout. Motion now lives where it cannot misplace content: the page entrance (`.rise-lift`),
 * drawers, and press/hover feedback.
 */

type DivProps = React.ComponentProps<"div">

export function Reveal(props: DivProps) {
  return <div {...props} />
}

export function Stagger(props: DivProps) {
  return <div {...props} />
}

export function StaggerItem({ className, ...props }: DivProps) {
  return <div className={cn("h-full", className)} {...props} />
}

/** Moves only (never hides), so the page's LCP content paints immediately. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="rise-lift">{children}</div>
}
