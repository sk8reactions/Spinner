"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Skull, Flame, Trophy } from "lucide-react"
import Reel from "./Reel"
import Handle from "./Handle"

const names = [
  "Ollie",
  "Nollie",
  "Fakie Pop",
  "Switch Pop",
  "BS Shuv",
  "FS Shuv",
  "Fakie FS Shuv",
  "Fakie BS Shuv",
  "Switch BS Shuv",
  "Switch FS Shuv",
  "Nollie BS Shuv",
  "Nollie FS Shuv",
  "BS 180",
  "FS 180",
  "Fakie BS 180",
  "Fakie FS 180",
  "Switch BS 180",
  "Switch FS 180",
  "Nollie BS 180",
  "Nollie FS 180",
  "Kickflip",
  "Heelflip",
  "Varial Flip",
  "Varial Heel",
]

export default function SlotMachine() {
  const [spinning, setSpinning] = useState(false)
  const [results, setResults] = useState(["", "", ""])
  const [reelStates, setReelStates] = useState([true, true, true])
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }, [])

  const spin = () => {
    if (spinning) return

    setSpinning(true)
    setResults(["", "", ""])
    setReelStates([true, true, true])

    const newResults = Array(3)
      .fill("")
      .map(() => names[Math.floor(Math.random() * names.length)])

    setTimeout(() => {
      setResults([newResults[0], results[1], results[2]])
      setReelStates([false, true, true])
    }, 4000)

    setTimeout(() => {
      setResults([newResults[0], newResults[1], results[2]])
      setReelStates([false, false, true])
    }, 5000)

    setTimeout(() => {
      setResults(newResults)
      setReelStates([false, false, false])
      setSpinning(false)
    }, 6000)
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Logo Space */}
      <div className="absolute -top-96 left-1/2 -translate-x-1/2 w-48 h-48 bg-black/50 rounded-full flex items-center justify-center border-4 border-yellow-500 overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5866-56CuMlc761ttHiemld00eOdJ6kk3iS.MOV"
          loop
          muted
          playsInline
        />
      </div>

      {/* Main Machine */}
      <motion.div
        className="relative bg-gradient-to-b from-red-900 to-red-800 rounded-lg shadow-2xl p-8 border-4 border-yellow-500"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-yellow-500 rounded-br-lg" />

        {/* Skateboard Icons */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2">
          <motion.div
            animate={{ rotateY: spinning ? 360 : 0 }}
            transition={{ duration: 2, repeat: spinning ? Number.POSITIVE_INFINITY : 0 }}
          >
            <Skull className="w-8 h-8 text-yellow-500" />
          </motion.div>
        </div>
        <div className="absolute -right-4 top-1/2 -translate-y-1/2">
          <motion.div
            animate={{ rotateY: spinning ? 360 : 0 }}
            transition={{ duration: 2, repeat: spinning ? Number.POSITIVE_INFINITY : 0 }}
          >
            <Skull className="w-8 h-8 text-yellow-500" />
          </motion.div>
        </div>

        {/* Flames */}
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2"
          animate={{ scale: spinning ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.5, repeat: spinning ? Number.POSITIVE_INFINITY : 0 }}
        >
          <Flame className="w-12 h-12 text-yellow-500" />
        </motion.div>

        {/* Reels Container */}
        <div className="relative bg-black/80 p-6 rounded-lg border-2 border-yellow-500 mb-8">
          <div className="flex justify-around gap-4">
            <Reel spinning={reelStates[0]} result={results[0]} delay={4} />
            <Reel spinning={reelStates[1]} result={results[1]} delay={5} />
            <Reel spinning={reelStates[2]} result={results[2]} delay={6} />
          </div>
        </div>

        {/* Trophy Icons */}
        <div className="flex justify-center gap-8 mt-4">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <Trophy className="w-6 h-6 text-yellow-500" />
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>

        <Handle onSpin={spin} spinning={spinning} />
      </motion.div>
    </div>
  )
}

