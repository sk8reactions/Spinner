"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Settings2, Download } from "lucide-react"
import html2canvas from "html2canvas"
import TrickCard from "./TrickCard"
import TrickToggles, { TrickTogglesState } from "./TrickToggles"

const SOCIAL_LINKS = [
  { name: "YouTube", href: "https://www.youtube.com/@sk8reactions", icon: "/icons/youtube.png" },
  { name: "Instagram", href: "https://www.instagram.com/sk8reactions/", icon: "/icons/instagram.png" },
  { name: "TikTok", href: "https://www.tiktok.com/@sk8reactions", icon: "/icons/tiktok.png" },
] as const

const TRICKS_MAP: { [key: string]: string } = {
  ollie: "Ollie",
  fs180: "FS 180",
  bs180: "BS 180",
  fsShuv: "FS Shuv",
  bsShuv: "BS Shuv",
  kickflip: "Kickflip",
  heelflip: "Heelflip",
  varialKickflip: "Varial Kickflip",
  varialHeelflip: "Varial Heelflip",
  hardflip: "Hardflip",
  inwardHeelflip: "Inward Heelflip",
  fs180Kickflip: "FS 180 Kickflip",
  bs180Kickflip: "BS 180 Kickflip",
  fs180Heelflip: "FS 180 Heelflip",
  bs180Heelflip: "BS 180 Heelflip",
  treFlip: "Tre Flip",
  impossible: "Impossible",
  fsBigspin: "FS Bigspin",
  bsBigspin: "BS Bigspin",
}

function buildAvailableTricks(toggles: TrickTogglesState): string[] {
  const stances = ["Regular"]
  if (toggles.stances.fakie) stances.push("Fakie")
  if (toggles.stances.nollie) stances.push("Nollie")
  if (toggles.stances.switch) stances.push("Switch")

  const out: string[] = []
  stances.forEach((stance) => {
    Object.entries(TRICKS_MAP).forEach(([key, trick]) => {
      if (!toggles.tricks[key as keyof typeof toggles.tricks]) return
      out.push(stance === "Regular" ? trick : (trick === "Ollie" && stance === "Nollie" ? "Nollie" : `${stance} ${trick}`))
    })
  })
  return out.length ? out : ["Ollie"]
}

function pickThreeUnique(tricks: string[]): [string, string, string] {
  const pool = [...tricks]
  const result: string[] = []
  for (let i = 0; i < 3; i++) {
    if (pool.length === 0) break
    const idx = Math.floor(Math.random() * pool.length)
    const pick = pool[idx] === "Nollie Ollie" ? "Nollie" : pool[idx]
    result.push(pick)
    pool.splice(idx, 1)
  }
  while (result.length < 3) {
    result.push(tricks[Math.floor(Math.random() * tricks.length)])
  }
  return result as [string, string, string]
}

/** Check if we can use the captureStream + MediaRecorder path */
function canUseCaptureStream(): boolean {
  try {
    const testCanvas = document.createElement("canvas")
    testCanvas.width = 2
    testCanvas.height = 2
    return typeof testCanvas.captureStream === "function"
  } catch {
    return false
  }
}

/** Pick the best supported mime type for MediaRecorder path */
function getBestMimeType(): { mimeType: string; ext: string } {
  const candidates: { mimeType: string; ext: string }[] = [
    { mimeType: "video/mp4", ext: "mp4" },
    { mimeType: "video/mp4;codecs=avc1", ext: "mp4" },
    { mimeType: "video/webm;codecs=h264", ext: "webm" },
    { mimeType: "video/webm;codecs=vp9", ext: "webm" },
    { mimeType: "video/webm;codecs=vp8", ext: "webm" },
    { mimeType: "video/webm", ext: "webm" },
  ]
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c.mimeType)) return c
  }
  return { mimeType: "video/webm", ext: "webm" }
}

/** Check if WebCodecs VideoEncoder is available (Safari 16.4+, Chrome 94+) */
function canUseVideoEncoder(): boolean {
  return typeof VideoEncoder !== "undefined"
}

export default function SlotMachine() {
  const [setupComplete, setSetupComplete] = useState(false)
  const [results, setResults] = useState<string[]>(["", "", ""])
  const [spinningReels, setSpinningReels] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [isRecording, setIsRecording] = useState(false)
  const [clipReady, setClipReady] = useState(false)
  const [trickToggles, setTrickToggles] = useState<TrickTogglesState>({
    stances: { fakie: false, nollie: false, switch: false },
    tricks: {
      ollie: true, fs180: false, bs180: false, fsShuv: false, bsShuv: false,
      kickflip: false, heelflip: false, varialKickflip: false, varialHeelflip: false,
      hardflip: false, inwardHeelflip: false, fs180Kickflip: false, bs180Kickflip: false,
      fs180Heelflip: false, bs180Heelflip: false, treFlip: false, impossible: false,
      fsBigspin: false, bsBigspin: false,
    },
  })

  const recordZoneRef = useRef<HTMLDivElement>(null)
  const clipBlobRef = useRef<Blob | null>(null)
  const clipExtRef = useRef<string>("mp4")
  const availableTricks = buildAvailableTricks(trickToggles)
  const anySpinning = spinningReels[0] || spinningReels[1] || spinningReels[2]
  const hasResults = results.every(Boolean)

  // Revoke old clip URL on unmount
  useEffect(() => {
    return () => { clipBlobRef.current = null }
  }, [])

  /** Shared html2canvas snapshot helper */
  const snapElement = (el: HTMLElement, scale: number, elW: number, elH: number) =>
    html2canvas(el, {
      backgroundColor: "#0a0a0a",
      scale,
      logging: false,
      useCORS: true,
      width: elW,
      height: elH,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
      scrollX: 0,
      scrollY: 0,
      removeContainer: true,
      ignoreElements: (element) => element.tagName === "VIDEO",
    })

  /** Spin + record in one action */
  const spinAll = useCallback(async () => {
    if (anySpinning || isRecording) return

    // Clear old clip
    clipBlobRef.current = null
    setClipReady(false)

    // Pick tricks
    const picks = pickThreeUnique(availableTricks)

    // --- Start recording ---
    const el = recordZoneRef.current
    if (!el) return

    setIsRecording(true)

    const fps = 10
    const frameInterval = 1000 / fps
    const scale = 2
    const elW = el.offsetWidth
    const elH = el.offsetHeight
    const width = Math.round(elW * scale)
    const height = Math.round(elH * scale)

    // Decide recording path
    const useCaptureStream = canUseCaptureStream()
    const useEncoder = !useCaptureStream && canUseVideoEncoder()

    // Shared canvas for drawing frames
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, width, height)

    // ----- PATH A: captureStream + MediaRecorder (Chrome/Firefox) -----
    let recorder: MediaRecorder | null = null
    let chunks: Blob[] = []
    let mimeType = ""

    // ----- PATH B: VideoEncoder + mp4-muxer (Safari/iOS) -----
    let encoder: VideoEncoder | null = null
    let muxer: import("mp4-muxer").Muxer<import("mp4-muxer").ArrayBufferTarget> | null = null

    if (useCaptureStream) {
      const best = getBestMimeType()
      mimeType = best.mimeType
      clipExtRef.current = best.ext

      const stream = canvas.captureStream(fps)
      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 })
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.start(100)
    } else if (useEncoder) {
      clipExtRef.current = "mp4"
      const { Muxer: MuxerClass, ArrayBufferTarget } = await import("mp4-muxer")
      const target = new ArrayBufferTarget()
      muxer = new MuxerClass({
        target,
        video: { codec: "avc", width, height },
        fastStart: "in-memory",
      })
      encoder = new VideoEncoder({
        output: (chunk, meta) => { muxer!.addVideoChunk(chunk, meta ?? undefined) },
        error: (e) => console.error("VideoEncoder error:", e),
      })
      encoder.configure({
        codec: "avc1.42001f",
        width,
        height,
        bitrate: 4_000_000,
        framerate: fps,
      })
    } else {
      // No recording support — still spin but skip recording
      clipExtRef.current = "mp4"
    }

    let capturing = true
    let frameIndex = 0
    const captureFrame = async () => {
      if (!capturing) return
      try {
        const snapshot = await snapElement(el, scale, elW, elH)
        ctx.fillStyle = "#0a0a0a"
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(snapshot, 0, 0, width, height)

        // For encoder path, feed frame
        if (useEncoder && encoder && encoder.state === "configured") {
          const frame = new VideoFrame(canvas, {
            timestamp: frameIndex * (1_000_000 / fps), // microseconds
            duration: 1_000_000 / fps,
          })
          encoder.encode(frame)
          frame.close()
        }
        frameIndex++
      } catch {
        // skip frame
      }
      if (capturing) setTimeout(captureFrame, frameInterval)
    }
    captureFrame()

    // --- Trigger the spin ---
    setSpinningReels([true, true, true])

    const resolve = (reelIndex: number) => {
      setResults((prev) => {
        const next = [...prev]
        next[reelIndex] = picks[reelIndex]
        return next
      })
      setSpinningReels((prev) => {
        const next = [...prev] as [boolean, boolean, boolean]
        next[reelIndex] = false
        return next
      })
    }

    setTimeout(() => resolve(0), 3000)
    setTimeout(() => resolve(1), 6000)
    setTimeout(() => resolve(2), 9000)

    // Wait for all reels + 1.5s hold on the final result
    await new Promise((r) => setTimeout(r, 10500))

    // --- Stop recording ---
    capturing = false

    let blob: Blob | null = null

    if (useCaptureStream && recorder) {
      recorder.stop()
      await new Promise<void>((r) => { recorder!.onstop = () => r() })
      blob = new Blob(chunks, { type: mimeType })
    } else if (useEncoder && encoder && muxer) {
      await encoder.flush()
      encoder.close()
      muxer.finalize()
      const buf = (muxer.target as import("mp4-muxer").ArrayBufferTarget).buffer
      blob = new Blob([buf], { type: "video/mp4" })
    }

    if (blob && blob.size > 0) {
      clipBlobRef.current = blob
      setClipReady(true)
    }
    setIsRecording(false)
  }, [availableTricks, anySpinning, isRecording])

  /** Download / share the stored clip */
  const handleDownloadClip = useCallback(async () => {
    const blob = clipBlobRef.current
    if (!blob) return

    const filename = `sk8reactions-3tricks.${clipExtRef.current}`

    // iOS Safari: use native share sheet if available (blob download doesn't work)
    if (navigator.share && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        const file = new File([blob], filename, { type: blob.type })
        await navigator.share({ files: [file] })
        return
      } catch {
        // User cancelled or share failed — fall through to download
      }
    }

    // Standard download
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }, [])

  /* Setup modal */
  if (!setupComplete) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass-panel-elevated w-full max-w-lg p-5 sm:p-7 max-h-[90vh] flex flex-col gap-4"
          >
            <div className="flex flex-col items-center gap-2">
              <Image src="/sk8reactions-header.png" alt="@sk8reactions" width={800} height={160} className="w-full h-auto object-contain" priority />
              <h2 className="text-heading text-2xl">Set your move list</h2>
              <p className="text-muted text-sm">Pick stances and moves to randomize</p>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 rounded-xl gradient-flow p-4 border border-white/[0.06]">
              <TrickToggles onTogglesChange={setTrickToggles} />
            </div>
            <motion.button
              type="button"
              onClick={() => setSetupComplete(true)}
              className="btn-primary w-full px-4 h-[98px] flex items-center justify-center overflow-visible"
              whileTap={{ scale: 0.97 }}
            >
              <Image src="/lets-roll.png" alt="Let's Roll" width={600} height={120} className="h-[101px] w-auto object-contain pointer-events-none" />
            </motion.button>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-8 sm:py-12 landscape:py-2 landscape:flex-1 landscape:min-h-0 landscape:max-h-dvh landscape:gap-2">

      {/* Socials + settings */}
      <nav className="socials-bar gradient-flow flex items-center gap-3 mb-6" aria-label="Social links">
        {SOCIAL_LINKS.map(({ name, href, icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn"
            title={name}
          >
            <Image
              src={icon}
              alt={name}
              width={26}
              height={26}
              className="w-[26px] h-[26px] object-contain opacity-80 hover:opacity-100 transition-opacity [filter:brightness(0)_invert(1)]"
            />
          </a>
        ))}
        <button
          type="button"
          onClick={() => setSetupComplete(false)}
          className="social-icon-btn"
          title="Edit moves"
        >
          <Settings2 className="w-[26px] h-[26px] text-zinc-300 hover:text-white transition-colors" />
        </button>
      </nav>

      {/* SPIN button (outside recording zone — not captured in clip) */}
      <motion.button
        type="button"
        onClick={spinAll}
        disabled={anySpinning || isRecording}
        className="btn-primary w-full px-4 h-[98px] flex items-center justify-center mb-4 overflow-visible"
        whileTap={!anySpinning && !isRecording ? { scale: 0.97 } : {}}
      >
        <Image src="/spin-btn.png" alt="Spin" width={600} height={140} className="h-[101px] w-auto object-contain pointer-events-none" />
      </motion.button>

      {/* === Recording zone: logo + trick slots === */}
      <div ref={recordZoneRef} className="w-full flex flex-col items-center gap-2 pt-1 px-1 pb-4 rounded-lg" style={{ background: "#0a0a0a" }}>
        {/* Logo header for the clip */}
        <Image src="/sk8reactions-header.png" alt="@sk8reactions" width={800} height={160} className="w-full h-auto object-contain" priority />

        {/* 3 Trick Slots */}
        <div className="w-full space-y-2">
          {[0, 1, 2].map((i) => (
            <TrickCard
              key={i}
              index={i}
              result={results[i]}
              spinning={spinningReels[i]}
            />
          ))}
        </div>

        {/* Bottom spacing for recording */}
        <div className="h-2" />
      </div>
      {/* === End recording zone === */}

      {/* Recording indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 mt-4 text-sm text-red-400"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Clip button — only shows when clip is ready and not spinning */}
      <AnimatePresence>
        {clipReady && !anySpinning && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full mt-4"
          >
            <button
              type="button"
              onClick={handleDownloadClip}
              className="btn-ghost w-full flex items-center justify-center gap-2.5 py-3.5 px-4 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Clip</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <a
        href="https://sk8reactions.cloud"
        target="_blank"
        rel="noopener noreferrer"
        className="text-dim text-[10px] tracking-[0.15em] uppercase mt-8 opacity-50 hover:opacity-80 transition-opacity"
      >
        @sk8reactions
      </a>
    </div>
  )
}
