import Image from "next/image"
import Link from "next/link"

interface LogoProps {
    size?: "sm" | "md" | "lg"
    showText?: boolean
}

export function Logo({ size = "md", showText = true }: LogoProps) {
    const dimensions = {
        sm: { width: 24, height: 24 },
        md: { width: 32, height: 32 },
        lg: { width: 48, height: 48 },
    }

    const { width, height } = dimensions[size]

    return (
        <Link href="/" className="flex items-center space-x-2">
            <div className="relative" style={{ width, height }}>
                <Image src="/apple-icon.png" alt="PhayiHairline Logo" width={width} height={height} className="object-contain" />
            </div>
            {showText && <span className="font-bold text-xl text-primary">PhayiHairline</span>}
        </Link>
    )
}

