"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { createContext, useCallback, useContext, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** `danger` (default) styles the confirm button red and focuses Cancel first. */
  tone?: "danger" | "default"
}

type Ask = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<Ask | null>(null)

/**
 * A reusable confirmation dialog that replaces `window.confirm`.
 *
 *   const confirm = useConfirm()
 *   if (!(await confirm({ title: "Delete product?", confirmLabel: "Delete" }))) return
 *
 * Resolves `true` on confirm and `false` on cancel, Escape or an outside click.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  // Kept after close so the text doesn't change while the exit animation plays.
  const [options, setOptions] = useState<ConfirmOptions>({ title: "" })
  const resolver = useRef<((value: boolean) => void) | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const ask = useCallback<Ask>((next) => new Promise<boolean>((resolve) => {
    resolver.current?.(false) // a second prompt cancels the first
    resolver.current = resolve
    setOptions(next)
    setOpen(true)
  }), [])

  const settle = (value: boolean) => {
    resolver.current?.(value)
    resolver.current = null
    setOpen(false)
  }

  const danger = (options.tone ?? "danger") === "danger"
  const Icon = danger ? AlertTriangle : HelpCircle

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      <Dialog.Root open={open} onOpenChange={(next) => { if (!next) settle(false) }}>
        <AnimatePresence>
          {open && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-[60] bg-black/45 md:backdrop-blur-sm"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              </Dialog.Overlay>
              <div className="pointer-events-none fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
                <Dialog.Content
                  asChild
                  role="alertdialog"
                  // Land on the safe choice so a stray Enter never deletes something.
                  onOpenAutoFocus={(e) => { if (danger) { e.preventDefault(); cancelRef.current?.focus() } }}
                >
                  <motion.div
                    className="pointer-events-auto w-full max-w-sm rounded-2xl border bg-background p-6 shadow-2xl"
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  >
                    <div className="flex gap-4">
                      <span className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full",
                        danger ? "bg-destructive/10 text-destructive" : "bg-muted text-accent-text",
                      )}>
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <Dialog.Title className="font-serif text-lg font-semibold leading-tight">{options.title}</Dialog.Title>
                        <Dialog.Description className={cn("mt-1.5 text-sm text-muted-foreground", !options.description && "sr-only")}>
                          {options.description ?? options.title}
                        </Dialog.Description>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <Button ref={cancelRef} variant="outline" onClick={() => settle(false)}>
                        {options.cancelLabel ?? "Cancel"}
                      </Button>
                      <Button variant={danger ? "destructive" : "default"} onClick={() => settle(true)}>
                        {options.confirmLabel ?? "Confirm"}
                      </Button>
                    </div>
                  </motion.div>
                </Dialog.Content>
              </div>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): Ask {
  const ask = useContext(ConfirmContext)
  if (!ask) throw new Error("useConfirm must be used inside <ConfirmProvider>")
  return ask
}
