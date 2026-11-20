"use client"

import { Plus, Trash2, Wand2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type VariantRow = {
  id?: string
  options: Record<string, string>
  price: string
  compare_at_price: string
  stock: string
}

type Props = {
  optionNames: string[]
  onOptionNames: (names: string[]) => void
  rows: VariantRow[]
  onRows: (rows: VariantRow[]) => void
  basePrice: string
}

const split = (s: string) => s.split(",").map((v) => v.trim()).filter(Boolean)
const cross = (lists: string[][]): string[][] =>
  lists.reduce<string[][]>((acc, list) => acc.flatMap((a) => list.map((v) => [...a, v])), [[]])

export function VariantEditor({ optionNames, onOptionNames, rows, onRows, basePrice }: Props) {
  const [namesText, setNamesText] = useState(optionNames.join(", "))
  const [valuesText, setValuesText] = useState<Record<string, string>>(() =>
    Object.fromEntries(optionNames.map((n) => [n, [...new Set(rows.map((r) => r.options[n]).filter(Boolean))].join(", ")])),
  )

  const names = split(namesText).slice(0, 3)
  const patch = (i: number, p: Partial<VariantRow>) => onRows(rows.map((r, j) => (j === i ? { ...r, ...p } : r)))

  function generate() {
    const combos = cross(names.map((n) => split(valuesText[n] ?? "")))
    if (!combos.length || combos[0]?.length !== names.length) return
    onOptionNames(names)
    onRows(combos.map((combo) => {
      const options = Object.fromEntries(names.map((n, i) => [n, combo[i]!]))
      const prev = rows.find((r) => names.every((n) => r.options[n] === options[n]))
      return prev ?? { options, price: basePrice || "0", compare_at_price: "", stock: "5" }
    }))
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">Variants</p>
        <p className="text-xs text-muted-foreground">
          For products sold in sizes, e.g. wig length and density. Each combination gets its own price and stock.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Option names</span>
          <Input value={namesText} onChange={(e) => setNamesText(e.target.value)} placeholder="Length, Density" />
        </label>
        {names.map((n) => (
          <label key={n} className="space-y-1.5 text-sm">
            <span className="font-medium">{n} values</span>
            <Input value={valuesText[n] ?? ""} placeholder={n === "Length" ? '14", 18", 22"' : "Comma separated"}
              onChange={(e) => setValuesText((v) => ({ ...v, [n]: e.target.value }))} />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" disabled={!names.length} onClick={generate}>
          <Wand2 /> Generate combinations
        </Button>
        {rows.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => { onRows([]); onOptionNames([]) }}>
            Remove all variants
          </Button>
        )}
      </div>

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                {optionNames.map((n) => <th key={n} className="pb-2 pr-2 font-medium">{n}</th>)}
                <th className="pb-2 pr-2 font-medium">Price (₦)</th>
                <th className="pb-2 pr-2 font-medium">Compare-at</th>
                <th className="pb-2 pr-2 font-medium">Stock</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id ?? i}>
                  {optionNames.map((n) => (
                    <td key={n} className="py-1 pr-2">
                      <Input className="h-9" value={r.options[n] ?? ""} aria-label={`${n} for variant ${i + 1}`}
                        onChange={(e) => patch(i, { options: { ...r.options, [n]: e.target.value } })} />
                    </td>
                  ))}
                  <td className="py-1 pr-2"><Input className="h-9" type="number" min={0} value={r.price} aria-label="Price" onChange={(e) => patch(i, { price: e.target.value })} /></td>
                  <td className="py-1 pr-2"><Input className="h-9" type="number" min={0} value={r.compare_at_price} aria-label="Compare-at price" onChange={(e) => patch(i, { compare_at_price: e.target.value })} /></td>
                  <td className="py-1 pr-2"><Input className="h-9" type="number" min={0} value={r.stock} aria-label="Stock" onChange={(e) => patch(i, { stock: e.target.value })} /></td>
                  <td className="py-1">
                    <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Remove variant"
                      onClick={() => onRows(rows.filter((_, j) => j !== i))}><Trash2 /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button type="button" variant="ghost" size="sm" className="mt-2"
            onClick={() => onRows([...rows, { options: Object.fromEntries(optionNames.map((n) => [n, ""])), price: basePrice || "0", compare_at_price: "", stock: "0" }])}>
            <Plus /> Add row
          </Button>
        </div>
      )}
    </div>
  )
}
