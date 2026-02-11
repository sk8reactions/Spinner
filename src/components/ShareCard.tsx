"use client"

import { useState } from "react"
import { Copy, Check, Share2 } from "lucide-react"

interface ShareCardProps {
  results: string[]
  challengeTitle?: string
  onClose?: () => void
}

export default function ShareCard({ results, challengeTitle, onClose }: ShareCardProps) {
  const [copied, setCopied] = useState(false)
  const link = typeof window !== "undefined" ? window.location.href : ""
  const tricks = results.filter(Boolean)
  const hasResults = tricks.length >= 3

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Rolling — @sk8reactions",
          text: `My line: ${tricks.join(" → ")}. @sk8reactions. Try yours: ${link}`,
          url: link,
        })
      } catch {}
    } else {
      handleCopyLink()
    }
  }

  if (!hasResults) return null

  return (
    <div className="panel-grungy rounded-lg p-4 sm:p-6 text-center">
      <p className="text-brand text-sm font-semibold tracking-widest mb-2">@sk8reactions</p>
      <h3 className="text-street text-xl font-semibold tracking-tight mb-1">
        Rolling
      </h3>
      {challengeTitle && (
        <p className="text-sm text-metallic-muted mb-3">{challengeTitle}</p>
      )}
      <div className="space-y-1 mb-4">
        {tricks.map((t, i) => (
          <div key={i} className="text-street-sm text-lg font-medium">
            {i + 1}. {t}
          </div>
        ))}
      </div>
      <p className="text-brand text-sm font-semibold mb-4">@sk8reactions</p>
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={handleShare}
          className="text-street btn-siren flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium border-2 shadow-street-glow text-sm"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black/40 text-metallic-muted font-medium hover:bg-rust/20 border-2 border-concrete/50 text-sm"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
      <p className="text-xs text-metallic-muted mt-3 break-all opacity-80">{link}</p>
    </div>
  )
}
