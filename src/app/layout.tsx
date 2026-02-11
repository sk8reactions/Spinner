import "@/app/globals.css"
import type { Metadata, Viewport } from "next"
import type React from "react"

// Canonical base (www is production; apex redirects to www)
const canonicalUrl = "https://www.sk8reactions.cloud"

export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl),
  title: {
    default: "SK8Reactions — Skate Trick Roulette",
    template: "%s | SK8Reactions",
  },
  description:
    "Spin random skate tricks, build challenges, and level up your skate sessions.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    type: "website",
    url: canonicalUrl,
    title: "SK8Reactions — Skate Trick Roulette",
    description:
      "Spin random skate tricks, build challenges, and level up your skate sessions.",
    siteName: "SK8Reactions",
    locale: "en_US",
    images: [
      { url: "/og-image.png?v=8", width: 1200, height: 630, alt: "SK8Reactions — 3 Random Moves" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SK8Reactions — Skate Trick Roulette",
    description:
      "Spin random skate tricks, build challenges, and level up your skate sessions.",
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
