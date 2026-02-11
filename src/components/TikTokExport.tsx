"use client"

import { useState } from "react"
import { Download, Copy, Check } from "lucide-react"

const OVERLAY_TITLE = "Rolling"
const OVERLAY_FOOTER = "@sk8reactions"
const WIDTH = 1080
const HEIGHT = 1920

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  tricks: string[]
) {
  ctx.fillStyle = "transparent"
  ctx.clearRect(0, 0, WIDTH, HEIGHT)

  const lineHeight = 100
  let y = 320

  ctx.fillStyle = "#ffffff"
  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 4
  ctx.font = "bold 72px Inter, -apple-system, sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  const drawText = (text: string, fontSize?: number) => {
    if (fontSize) ctx.font = `bold ${fontSize}px Inter, -apple-system, sans-serif`
    const x = WIDTH / 2
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)
    y += lineHeight + 40
  }

  drawText(OVERLAY_TITLE, 64)
  y += 40
  ctx.font = "bold 56px Inter, -apple-system, sans-serif"
  tricks.forEach((t, i) => drawText(`${i + 1}. ${t}`, 56))
  y += 80
  ctx.font = "28px Inter, -apple-system, sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.8)"
  ctx.strokeStyle = "rgba(0,0,0,0.5)"
  ctx.strokeText(OVERLAY_FOOTER, WIDTH / 2, HEIGHT - 120)
  ctx.fillText(OVERLAY_FOOTER, WIDTH / 2, HEIGHT - 120)
}

function generateScript(tricks: string[], link: string): string {
  const hook = "Hitting the @sk8reactions trick challenge today"
  const list = tricks.map((t, i) => `${i + 1}. ${t}`).join("\n")
  const cta = `Try yours: ${link}`
  const hashtags = "#skate #drone #challenge #skateboarding #3tricks1run"
  return [hook, "", list, "", cta, "", hashtags].join("\n")
}

interface TikTokExportProps {
  results: string[]
}

export default function TikTokExport({ results }: TikTokExportProps) {
  const [copied, setCopied] = useState(false)
  const tricks = results.filter(Boolean)
  const hasResults = tricks.length >= 3

  const handleDownload = () => {
    if (!hasResults) return
    const canvas = document.createElement("canvas")
    canvas.width = WIDTH
    canvas.height = HEIGHT
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    drawOverlay(ctx, tricks)
    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = "tiktok-overlay-3tricks.png"
    a.click()
  }

  const handleCopyScript = async () => {
    const link = typeof window !== "undefined" ? window.location.href : ""
    const script = generateScript(tricks, link)
    try {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  if (!hasResults) return null

  return (
    <div className="w-full flex items-center gap-2">
      <button
        type="button"
        onClick={handleDownload}
        className="btn-ghost flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm"
      >
        <Download className="w-4 h-4" />
        <span>Download Overlay</span>
      </button>
      <button
        type="button"
        onClick={handleCopyScript}
        className="btn-ghost flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        <span>{copied ? "Copied!" : "Copy Caption"}</span>
      </button>
    </div>
  )
}
