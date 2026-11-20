"use client"

import { motion } from "framer-motion"
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
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const selected = selection[name] === value
                const others = Object.fromEntries(Object.entries(selection).filter(([k]) => k !== name))
                const available = isAvailable(variants, { ...others, [name]: value })
                return (
                  <motion.button
                    key={value}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    aria-pressed={selected}
                    onClick={() => onSelect(name, value)}
                    className={cn(
                      "relative min-w-14 rounded-md border px-4 py-2 text-sm transition-colors",
                      selected ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                      !available && !selected && "text-muted-foreground line-through opacity-50",
                    )}
                  >
                    {value}
                  </motion.button>
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
