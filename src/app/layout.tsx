import "@/app/globals.css"
import type { Metadata, Viewport } from "next"
import type React from "react"

export const metadata: Metadata = {
  title: "@sk8reactions — 3 Tricks 1 Run",
  description: "Skate trick wheel by @sk8reactions. Pick your moves, spin the wheel, stomp the line.",
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
