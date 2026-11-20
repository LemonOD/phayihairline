import Image from "next/image"

/** Round brand photo from the business's social profile, shown beside the wordmark. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <Image src="/brand/avatar.jpg" alt="" width={size} height={size} className="rounded-full object-cover ring-1 ring-accent/60" />
  )
}
