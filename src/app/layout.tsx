import "@/app/globals.css"
import type { Metadata, Viewport } from "next"
import type React from "react"

export const metadata: Metadata = {
  metadataBase: new URL("https://sk8reactions.cloud"),
  title: "Spin 3 Random Moves",
  description: "Pick your moves, spin, stomp the line.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    url: "https://sk8reactions.cloud",
    title: "3 Random Moves",
    description: "Pick your moves, spin, stomp the line.",
    siteName: "SK8REACTIONS",
    locale: "en_US",
    images: [
      { url: "/og-image.png?v=8", width: 1200, height: 630, alt: "3 Random Moves" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "3 Random Moves",
    description: "Pick your moves, spin, stomp the line.",
    images: ["/og-image.png?v=8"],
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
