import { ImageResponse } from "next/og"

export const ogSize = { width: 1200, height: 630 }

type Props = { eyebrow: string; title: string; subtitle?: string; image?: string | null }

/** Shared Open Graph card: warm brand palette, serif headline, optional product photo. */
export function ogImage({ eyebrow, title, subtitle, image }: Props) {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#faf7f2", fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, padding: 72 }}>
          <div style={{ fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: "#a9772a", fontFamily: "sans-serif" }}>
            {eyebrow}
          </div>
          <div style={{ fontSize: title.length > 40 ? 64 : 80, lineHeight: 1.05, color: "#2b211c", marginTop: 24 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 34, color: "#6b5d52", marginTop: 28, fontFamily: "sans-serif" }}>{subtitle}</div>}
          <div style={{ display: "flex", fontSize: 28, color: "#2b211c", marginTop: 48 }}>
            Phayi<span style={{ color: "#a9772a" }}>Hairline</span>
          </div>
        </div>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- satori renders plain <img>
          <img src={image} alt="" width={480} height={630} style={{ objectFit: "cover" }} />
        ) : (
          <div style={{ width: 360, height: 630, background: "linear-gradient(135deg,#e9d8b4,#c99a45)", display: "flex" }} />
        )}
      </div>
    ),
    ogSize,
  )
}
