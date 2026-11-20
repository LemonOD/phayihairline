import Image from "next/image"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = { src?: string | null; alt: string; className?: string; sizes?: string; priority?: boolean }

/** Product photo with a tasteful placeholder when no image has been uploaded yet. */
export function ProductImage({ src, alt, className, sizes = "(max-width:768px) 50vw, 25vw", priority }: Props) {
  if (!src) {
    return (
      <div className={cn("flex size-full items-center justify-center bg-gradient-to-br from-secondary to-muted", className)}>
        <Sparkles className="size-8 text-accent" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    )
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />
}
