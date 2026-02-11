import "@/app/globals.css"
import type React from "react"

export const metadata = {
  title: "@sk8reactions — 3 Tricks 1 Run",
  description: "Skate trick wheel by @sk8reactions.",
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
