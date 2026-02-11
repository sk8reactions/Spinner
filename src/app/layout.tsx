import "@/app/globals.css"
import type { Metadata, Viewport } from "next"
import type React from "react"

export const metadata: Metadata = {
  title: "Spin 3 Random Moves",
  description: "Pick your moves, spin, stomp the line.",
  openGraph: {
    title: "@sk8reactions — 3 Random Moves",
    description: "Pick your moves, spin, stomp the line.",
    images: [{ url: "/og-image.png?v=6", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "@sk8reactions — 3 Random Moves",
    description: "Pick your moves, spin, stomp the line.",
    images: ["/og-image.png?v=6"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
