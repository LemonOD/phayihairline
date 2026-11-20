import * as React from "react"
import { Label } from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

type FieldProps = {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}

/**
 * Label + control + hint/error. The control gets `aria-invalid` and `aria-describedby` automatically,
 * so assistive tech reads the error or hint together with the input, not only when it first appears.
 */
export function Field({ label, htmlFor, error, hint, className, children }: FieldProps) {
  const errorId = `${htmlFor}-error`
  const hintId = `${htmlFor}-hint`
  const describedBy = error ? errorId : hint ? hintId : undefined

  const control = React.isValidElement<Record<string, unknown>>(children)
    ? React.cloneElement(children, {
        "aria-invalid": error ? true : children.props["aria-invalid"],
        "aria-describedby": [children.props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined,
      })
    : children

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">{label}</Label>
      {control}
      {hint && !error && <p id={hintId} className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={errorId} role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
