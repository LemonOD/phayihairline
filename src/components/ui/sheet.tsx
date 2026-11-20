"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  side?: "right" | "left"
  className?: string
  children: React.ReactNode
}

/** Radix dialog (a11y, focus trap) animated with Framer Motion. */
export function Sheet({ open, onOpenChange, title, description, side = "right", className, children }: SheetProps) {
  const x = side === "right" ? "100%" : "-100%"
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.aside
                className={cn(
                  "fixed inset-y-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl",
                  side === "right" ? "right-0" : "left-0",
                  className,
                )}
                initial={{ x }} animate={{ x: 0 }} exit={{ x }}
                transition={{ type: "spring", damping: 32, stiffness: 320 }}
              >
                <header className="flex items-start justify-between border-b p-5">
                  <div>
                    <Dialog.Title className="font-serif text-xl font-semibold">{title}</Dialog.Title>
                    <Dialog.Description className={cn("text-sm text-muted-foreground", !description && "sr-only")}>
                      {description ?? title}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close className="rounded-md p-1 hover:bg-muted" aria-label="Close">
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
