"use client"

import Image from "next/image"
import { useState } from "react"
import { ImagePlus, X } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

const MAX_BYTES = 5 * 1024 * 1024

type Props = { value: string[]; onChange: (urls: string[]) => void }

/** Uploads straight to the Supabase `product-images` bucket (admin-only via storage RLS). */
export function ImageUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    const supabase = createClient()
    const urls: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") || file.size > MAX_BYTES) {
        toast.error(`${file.name}: images only, max 5MB`)
        continue
      }
      const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`
      const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "31536000" })
      if (error) toast.error(error.message)
      else urls.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl)
    }
    onChange([...value, ...urls])
    setUploading(false)
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {value.map((url) => (
        <div key={url} className="group relative aspect-square overflow-hidden rounded-md border">
          <Image src={url} alt="" fill sizes="120px" className="object-cover" />
          <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((u) => u !== url))}
            className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
            <X className="size-3.5" />
          </button>
        </div>
      ))}
      <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed text-xs text-muted-foreground transition-colors hover:bg-muted">
        <ImagePlus className="size-5" />
        {uploading ? "Uploading…" : "Add"}
        <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={(e) => upload(e.target.files)} />
      </label>
    </div>
  )
}
