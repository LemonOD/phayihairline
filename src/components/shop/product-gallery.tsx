"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ProductImage } from "@/components/ui/product-image"
import { cn } from "@/lib/utils"

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const list = images.length ? images : [null]

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <AnimatePresence mode="wait">
          <motion.div key={active} className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <ProductImage src={list[active]} alt={name} sizes="(max-width:768px) 100vw, 50vw" priority />
          </motion.div>
        </AnimatePresence>
      </div>
      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {list.map((src, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}
              className={cn("relative aspect-square overflow-hidden rounded-md border-2 transition-all",
                i === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100")}>
              <ProductImage src={src} alt="" sizes="100px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
