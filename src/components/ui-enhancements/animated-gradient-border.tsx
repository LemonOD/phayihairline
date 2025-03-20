"use client"

import type { ReactNode } from "react"
import { cn } from "@/src/lib/utils"

interface AnimatedGradientBorderProps {
  children: ReactNode
  className?: string
  containerClassName?: string
  gradientClassName?: string
}

export function AnimatedGradientBorder({
  children,
  className,
  containerClassName,
  gradientClassName,
}: AnimatedGradientBorderProps) {
  return (
    <div className={cn("relative rounded-lg p-[1px] overflow-hidden", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-secondary to-primary animate-[gradient_3s_ease_infinite]",
          gradientClassName,
        )}
        style={{
          backgroundSize: "200% 200%",
        }}
      />
      <div className={cn("relative rounded-lg bg-background h-full w-full", className)}>{children}</div>
    </div>
  )
}

