"use client"

import { useState, useEffect, type ReactNode } from "react"
import { cn } from "@/src/lib/utils"

interface AnimatedGradientBorderProps {
    children: ReactNode
    className?: string
    showBorder?: boolean
}

export function AnimatedGradientBorder({ children, className, showBorder = true }: AnimatedGradientBorderProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
        }
    }, [])

    return (
        <div
            className={cn(
                "relative rounded-lg transition-all duration-300",
                isHovered && showBorder ? "scale-[1.01]" : "",
                className,
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {showBorder && (
                <div
                    className={`absolute -inset-[1px] rounded-lg bg-gradient-to-r from-primary via-primary/50 to-primary transition-opacity duration-300 ${
                        isHovered ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                        background: isHovered
                            ? `radial-gradient(circle at ${mousePosition.x}px ${
                                mousePosition.y
                            }px, hsl(var(--primary)), transparent 60%)`
                            : "",
                    }}
                />
            )}
            <div className="relative rounded-lg bg-background overflow-hidden">{children}</div>
        </div>
    )
}

