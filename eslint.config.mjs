import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const config = [
  ...nextVitals,
  ...nextTs,
  { rules: { "max-lines": ["error", { max: 250 }] } },
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "playwright-report/**", "test-results/**"] },
]

export default config
