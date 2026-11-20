"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { useLayoutEffect, useRef } from "react"
import { AnimatePresence, motion, useDragControls } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type Side = "right" | "left" | "bottom"

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** `bottom` is a phone-native sheet: rounded, with a grab handle you can drag down to dismiss. */
  side?: Side
  className?: string
  children: React.ReactNode
}

const spring = { type: "spring", damping: 34, stiffness: 380, mass: 0.9 } as const

const offscreen: Record<Side, { x?: string; y?: string }> = {
  right: { x: "100%" }, left: { x: "-100%" }, bottom: { y: "100%" },
}

const position: Record<Side, string> = {
  right: "inset-y-0 right-0 w-full max-w-md",
  left: "inset-y-0 left-0 w-[88%] max-w-sm",
  bottom: "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl",
}

/** Radix dialog (focus trap, Escape, scroll lock) animated with Framer Motion. */
export function Sheet({ open, onOpenChange, title, description, side = "right", className, children }: SheetProps) {
  // Drawers open from state (not a Dialog.Trigger), so remember the opener and give focus back on close.
  const opener = useRef<HTMLElement | null>(null)
  const drag = useDragControls()
  useLayoutEffect(() => {
    if (open) opener.current = document.activeElement as HTMLElement | null
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/45 md:backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild onCloseAutoFocus={(e) => {
              e.preventDefault()
              opener.current?.focus()
            }}>
              <motion.aside
                className={cn(
                  "fixed z-50 flex flex-col overscroll-contain bg-background shadow-2xl",
                  position[side],
                  side === "bottom" && "border-t",
                  className,
                )}
                initial={offscreen[side]} animate={{ x: 0, y: 0 }} exit={offscreen[side]}
                transition={spring}
                {...(side === "bottom" && {
                  drag: "y" as const,
                  dragControls: drag,
                  dragListener: false,
                  dragConstraints: { top: 0, bottom: 0 },
                  dragElastic: { top: 0, bottom: 0.6 },
                  onDragEnd: (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
                    if (info.offset.y > 110 || info.velocity.y > 600) onOpenChange(false)
                  },
                })}
              >
                {side === "bottom" && (
                  <div aria-hidden onPointerDown={(e) => drag.start(e)}
                    className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing">
                    <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
                  </div>
                )}
                <header className={cn("flex items-start justify-between border-b px-5 pb-4", side === "bottom" ? "pt-1" : "pt-5")}>
                  <div>
                    <Dialog.Title className="font-serif text-xl font-semibold">{title}</Dialog.Title>
                    <Dialog.Description className={cn("text-sm text-muted-foreground", !description && "sr-only")}>
                      {description ?? title}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close className="-mr-2 -mt-1 flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted active:scale-95" aria-label="Close">
                    <X className="size-5" />
                  </Dialog.Close>
                </header>
                {children}
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
