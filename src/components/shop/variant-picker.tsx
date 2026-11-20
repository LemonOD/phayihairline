"use client"

import { cn } from "@/lib/utils"
import type { Product, ProductVariant } from "@/types"

type Props = {
  product: Product
  selection: Record<string, string>
  onSelect: (option: string, value: string) => void
}

const unique = (values: string[]) => [...new Set(values)]

/** True if some in-stock variant matches `partial` (so we can grey out dead-end values). */
function isAvailable(variants: ProductVariant[], partial: Record<string, string>) {
  return variants.some(
    (v) => v.stock > 0 && Object.entries(partial).every(([k, val]) => v.options[k] === val),
  )
}

export function VariantPicker({ product, selection, onSelect }: Props) {
  const variants = product.variants ?? []

  return (
    <div className="space-y-5">
      {product.option_names.map((name) => {
        const values = unique(variants.map((v) => v.options[name]).filter((v): v is string => !!v))
        return (
          <fieldset key={name}>
            <legend className="mb-2 text-sm font-medium">
              {name}: <span className="text-muted-foreground">{selection[name] ?? "Select"}</span>
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {values.map((value) => {
                const selected = selection[name] === value
                const others = Object.fromEntries(Object.entries(selection).filter(([k]) => k !== name))
                const available = isAvailable(variants, { ...others, [name]: value })
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelect(name, value)}
                    className={cn(
                      "relative flex min-h-11 min-w-14 items-center justify-center rounded-lg border px-4 py-2 text-sm transition duration-150 active:scale-95",
                      selected ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                      !available && !selected && "text-muted-foreground line-through opacity-50",
                    )}
                  >
                    {value}
                    {/* Strikethrough alone says nothing to a screen reader. */}
                    {!available && <span className="sr-only"> (currently out of stock)</span>}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
