"use client"

import { useEffect } from "react"

/**
 * Last-resort boundary for failures in the root layout. It replaces the whole document, so it must
 * bring its own <html>/<body> and cannot rely on global styles or the app's theme.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en-NG">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#faf7f2", color: "#2b1d1a", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <main>
          <h1 style={{ fontSize: 32, margin: "0 0 12px" }}>Something went wrong</h1>
          <p style={{ margin: "0 0 24px", color: "#6b5f5a" }}>Please try again in a moment.</p>
          <button onClick={() => retry()} style={{ background: "#2b1d1a", color: "#fff", border: 0, borderRadius: 8, padding: "12px 24px", fontSize: 16, cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
