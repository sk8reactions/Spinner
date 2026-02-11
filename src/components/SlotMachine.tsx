"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Download } from "lucide-react"
import html2canvas from "html2canvas"
import TrickCard from "./TrickCard"
import TrickToggles, { TrickTogglesState } from "./TrickToggles"

const SOCIAL_LINKS = [
  { name: "Tre Skool", href: "https://treskoolskateboarding.nz/", icon: "/icons/treskool.png", blend: "none" as const, size: 40 },
  { name: "Hamilton Skate Association", href: "https://www.instagram.com/hamilton_skate_association/", icon: "/icons/hsa.png", blend: "none" as const, size: 40, circled: true },
  { name: "YouTube", href: "https://www.youtube.com/@sk8reactions", icon: "/icons/youtube.png", blend: "screen" as const, size: 84 },
  { name: "Instagram", href: "https://www.instagram.com/sk8reactions/", icon: "/icons/instagram.png", blend: "screen" as const, size: 84 },
  { name: "TikTok", href: "https://www.tiktok.com/@sk8reactions", icon: "/icons/tiktok.png", blend: "screen" as const, size: 84 },
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
  treFlip: "360 Flip",
  impossible: "Impossible",
  fsBigspin: "FS Bigspin",
  bsBigspin: "BS Bigspin",
  fs360Shuv: "FS 360 Shuv",
  bs360Shuv: "BS 360 Shuv",
  fsTailslide: "FS Tailslide",
  bsTailslide: "BS Tailslide",
  fsNoseslide: "FS Noseslide",
  bsNoseslide: "BS Noseslide",
  fs5050: "FS 50-50",
  bs5050: "BS 50-50",
  fs50: "FS 5-0",
  bs50: "BS 5-0",
  fsCrook: "FS Crook",
  bsCrook: "BS Crook",
  fsSmith: "FS Smith",
  bsSmith: "BS Smith",
  fsFeeble: "FS Feeble",
  bsFeeble: "BS Feeble",
  fsBlunt: "FS Blunt",
  bsBlunt: "BS Blunt",
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

/** Animated fire flames around buttons */
function FlameEffect() {
  // Generate flame particles distributed along the bottom and sides
  const flames = Array.from({ length: 18 }, (_, i) => {
    const colors = ["flame-red", "flame-orange", "flame-yellow"]
    const color = colors[i % 3]
    const left = `${(i / 18) * 100}%`
    const delay = `${(i * 0.15) % 1.2}s`
    const duration = `${0.8 + (i % 4) * 0.2}s`
    const size = 6 + (i % 3) * 3
    return (
      <span
        key={i}
        className={`flame ${color}`}
        style={{
          left,
          width: size,
          height: size * 2,
          animationDelay: delay,
          animationDuration: duration,
        }}
      />
    )
  })
  return <div className="btn-flames">{flames}</div>
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
      ollie: true, fs180: true, bs180: true, fsShuv: true, bsShuv: true,
      kickflip: true, heelflip: true, varialKickflip: false, varialHeelflip: false,
      hardflip: false, inwardHeelflip: false, fs180Kickflip: false, bs180Kickflip: false,
      fs180Heelflip: false, bs180Heelflip: false, treFlip: false, impossible: false,
      fsBigspin: false, bsBigspin: false,
      fs360Shuv: false, bs360Shuv: false,
      fsTailslide: false, bsTailslide: false, fsNoseslide: false, bsNoseslide: false,
      fs5050: false, bs5050: false, fs50: false, bs50: false,
      fsCrook: false, bsCrook: false, fsSmith: false, bsSmith: false,
      fsFeeble: false, bsFeeble: false, fsBlunt: false, bsBlunt: false,
    },
  })

  const recordZoneRef = useRef<HTMLDivElement>(null)
  const clipBlobRef = useRef<Blob | null>(null)
  const clipExtRef = useRef<string>("mp4")
  const availableTricks = buildAvailableTricks(trickToggles)
  const anySpinning = spinningReels[0] || spinningReels[1] || spinningReels[2]
  const hasResults = results.every(Boolean)

  // Revoke old clip URL on unmount + pre-load mp4-muxer so first spin isn't slow
  useEffect(() => {
    import("mp4-muxer").catch(() => {})
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

    const elW = el.offsetWidth
    const elH = el.offsetHeight

    // Decide recording path
    // iOS: prefer encoder, fall back to captureStream for older devices without VideoEncoder
    // Desktop: prefer captureStream, fall back to encoder
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document)
    const hasCaptureStream = canUseCaptureStream()
    const hasEncoder = canUseVideoEncoder()
    let useCaptureStream: boolean
    let useEncoder: boolean
    if (isIOS) {
      useEncoder = hasEncoder
      useCaptureStream = !hasEncoder && hasCaptureStream
    } else {
      useCaptureStream = hasCaptureStream
      useEncoder = !hasCaptureStream && hasEncoder
    }

    // Desktop uses high quality; iOS uses scale 1 for speed
    const scale = (useCaptureStream && !isIOS) ? 2 : 1
    const fps = (useCaptureStream && !isIOS) ? 15 : 5
    const frameInterval = 1000 / fps
    const width = Math.round(elW * scale)
    const height = Math.round(elH * scale)

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
      try {
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
          bitrate: 3_000_000,
          framerate: fps,
        })
      } catch (e) {
        console.error("Encoder setup failed:", e)
        encoder = null
        muxer = null
      }
    } else {
      clipExtRef.current = "mp4"
    }

    // --- Clear previous results and trigger spin ---
    setResults(["", "", ""])
    setSpinningReels([true, true, true])

    // Wait for React to re-render so first frame shows spinning state, not old results
    await new Promise((r) => setTimeout(r, 150))

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

    setTimeout(() => resolve(0), 1000)
    setTimeout(() => resolve(1), 2000)
    setTimeout(() => resolve(2), 3000)

    // Wrap entire recording in try/finally so isRecording ALWAYS clears
    try {
      if (useCaptureStream) {
        // ----- PATH A: Chrome/Firefox — async capture loop with captureStream -----
        let capturing = true
        const captureFrame = async () => {
          if (!capturing) return
          try {
            const snapshot = await snapElement(el, scale, elW, elH)
            ctx.fillStyle = "#0a0a0a"
            ctx.fillRect(0, 0, width, height)
            ctx.drawImage(snapshot, 0, 0, width, height)
          } catch { /* skip */ }
          if (capturing) setTimeout(captureFrame, frameInterval)
        }
        captureFrame()

        await new Promise((r) => setTimeout(r, 5000))
        capturing = false

        recorder!.stop()
        await new Promise<void>((r) => { recorder!.onstop = () => r() })
        const blob = new Blob(chunks, { type: mimeType })
        if (blob.size > 0) {
          clipBlobRef.current = blob
          setClipReady(true)
        }
      } else if (useEncoder && encoder && muxer) {
        // ----- PATH B: Safari/iOS — frame capture + encode -----
        // Fast 300ms loop for capable devices (13 Pro+) → smooth video.
        // If <3 frames captured, slow fallback with 1.5s timeouts kicks in
        // to guarantee at least 3 key frames for slower devices (SE, 12 mini).

        const TOTAL_MS = 5000
        const SNAP_TIMEOUT = 300
        const frames: { imageData: ImageData; timeMs: number }[] = []
        const t0 = performance.now()

        // Fast capture loop — grab as many frames as the device can handle
        while (performance.now() - t0 < TOTAL_MS) {
          const timeMs = performance.now() - t0
          try {
            const snap = await Promise.race([
              snapElement(el, scale, elW, elH),
              new Promise<never>((_, rej) =>
                setTimeout(() => rej(new Error("snap_timeout")), SNAP_TIMEOUT)
              ),
            ]) as HTMLCanvasElement
            ctx.drawImage(snap, 0, 0, width, height)
            frames.push({ imageData: ctx.getImageData(0, 0, width, height), timeMs })
            snap.width = 0
            snap.height = 0
          } catch {
            // timed out — skip this frame
          }
          await new Promise((r) => setTimeout(r, 4))
        }

        // Slow fallback: if <3 frames, device is too slow for the fast loop.
        // Capture key moments with generous 1.5s timeouts so slow devices
        // still produce a usable slideshow-style clip.
        if (frames.length < 3) {
          const keyTimes = [0, 1200, 2400, 3600, 4800]
          for (const holdAt of keyTimes) {
            try {
              const snap = await Promise.race([
                snapElement(el, scale, elW, elH),
                new Promise<never>((_, rej) => setTimeout(() => rej(new Error("fb_timeout")), 1500)),
              ]) as HTMLCanvasElement
              ctx.drawImage(snap, 0, 0, width, height)
              frames.push({ imageData: ctx.getImageData(0, 0, width, height), timeMs: holdAt })
              snap.width = 0
              snap.height = 0
            } catch { /* skip */ }
            await new Promise((r) => setTimeout(r, 50))
          }
        }

        // Phase 2: Encode captured frames into video
        if (frames.length > 0) {
          for (let i = 0; i < frames.length; i++) {
            const { imageData, timeMs } = frames[i]
            const nextMs = i < frames.length - 1 ? frames[i + 1].timeMs : TOTAL_MS
            const durationMs = Math.max(nextMs - timeMs, 100)
            try {
              ctx.putImageData(imageData, 0, 0)
              const vf = new VideoFrame(canvas, {
                timestamp: Math.round(timeMs * 1000), // microseconds
                duration: Math.round(durationMs * 1000),
              })
              encoder.encode(vf, { keyFrame: true })
              vf.close()
            } catch {
              // skip
            }
          }
        }

        // Drain encoder queue and finalize
        try { await encoder.flush() } catch { /* flush failed */ }
        try { encoder.close() } catch { /* close failed */ }
        try {
          muxer.finalize()
          const buf = (muxer.target as import("mp4-muxer").ArrayBufferTarget).buffer
          const blob = new Blob([buf], { type: "video/mp4" })
          if (blob.size > 0) {
            clipBlobRef.current = blob
            setClipReady(true)
          }
        } catch {
          // muxer finalize failed
        }
      } else {
        // No recording support, just wait for spin to finish
        await new Promise((r) => setTimeout(r, 5000))
      }
    } catch (err) {
      console.error("Recording error:", err)
    } finally {
      setIsRecording(false)
    }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/90" />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass-panel-elevated relative z-10 w-full max-w-lg p-5 sm:p-7 max-h-[90vh] flex flex-col gap-4"
          >
            <div className="flex flex-col items-center gap-2 -mx-2 sm:-mx-3">
              <Image src="/sk8reactions-header.png" alt="@sk8reactions" width={1000} height={200} className="w-full h-auto object-contain scale-110" priority />
              <h2 className="text-heading text-2xl">Set your move list</h2>
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
              <FlameEffect />
              <Image src="/lets-roll.png" alt="Let's Roll" width={600} height={120} className="h-[101px] w-auto object-contain pointer-events-none relative z-[1]" />
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
        {SOCIAL_LINKS.map(({ name, href, icon, blend, size, ...rest }) => {
          const circled = 'circled' in rest && (rest as Record<string, unknown>).circled;
          return (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn overflow-hidden"
              title={name}
            >
              {circled ? (
                <div
                  className="rounded-full bg-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                  style={{ width: size, height: size }}
                >
                  <Image
                    src={icon}
                    alt={name}
                    width={Math.round(size * 0.95)}
                    height={Math.round(size * 0.95)}
                    style={{ width: Math.round(size * 0.95), height: Math.round(size * 0.95) }}
                    className="object-contain"
                  />
                </div>
              ) : (
                <Image
                  src={icon}
                  alt={name}
                  width={size}
                  height={size}
                  style={{ width: size, height: size }}
                  className={`object-contain opacity-80 hover:opacity-100 transition-opacity rounded-xl ${
                    blend === "screen" ? "mix-blend-screen" :
                    blend === "multiply" ? "mix-blend-multiply" :
                    ""
                  }`}
                />
              )}
            </a>
          );
        })}
        <button
          type="button"
          onClick={() => setSetupComplete(false)}
          className="social-icon-btn"
          title="Edit moves"
        >
          <svg width="46" height="46" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80 hover:opacity-100 transition-opacity">
            <rect x="4" y="14" width="28" height="6" rx="3" fill="#d4d4d8" />
            <rect x="6" y="15" width="24" height="4" rx="2" fill="#a1a1aa" />
            <circle cx="10" cy="23" r="3" fill="#d4d4d8" />
            <circle cx="10" cy="23" r="1.5" fill="#a1a1aa" />
            <circle cx="26" cy="23" r="3" fill="#d4d4d8" />
            <circle cx="26" cy="23" r="1.5" fill="#a1a1aa" />
            <rect x="7" y="20" width="6" height="2" rx="1" fill="#a1a1aa" />
            <rect x="23" y="20" width="6" height="2" rx="1" fill="#a1a1aa" />
          </svg>
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
        <FlameEffect />
        <Image src="/spin-btn.png" alt="Spin" width={600} height={140} className="h-[101px] w-auto object-contain pointer-events-none relative z-[1]" />
      </motion.button>

      {/* === Recording zone: trick slots + logo === */}
      <div ref={recordZoneRef} className="w-full flex flex-col items-center gap-2 pt-2 px-1 pb-2 rounded-lg" style={{ background: "#0a0a0a" }}>
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

        {/* Logo footer for the clip */}
        <Image src="/sk8reactions-header.png" alt="@sk8reactions" width={1000} height={200} className="w-full h-auto object-contain scale-110 mt-1" priority />
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

    </div>
  )
}
