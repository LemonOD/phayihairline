import { cn } from "@/lib/utils"

type IconProps = { className?: string }

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" className={cn("size-4", className)} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-4", className)} aria-hidden>
      <path d="M19.6 6.8a4.8 4.8 0 0 1-3.8-4.3h-3.4v13.3a2.9 2.9 0 1 1-2-2.8V9.5a6.3 6.3 0 1 0 5.4 6.3V9.3a8.1 8.1 0 0 0 3.8 1.2V7.1Z" />
    </svg>
  )
}

export const socialIcons = {
  instagram: { Icon: InstagramIcon, label: "Instagram" },
  tiktok: { Icon: TikTokIcon, label: "TikTok" },
} as const

export type SocialPlatform = keyof typeof socialIcons
