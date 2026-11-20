import { jsonLdScript } from "@/lib/seo"

export const JsonLd = ({ data }: { data: unknown }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(data)} />
)
