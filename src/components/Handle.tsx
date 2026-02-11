"use client"

import { motion } from "framer-motion"

interface HandleProps {
  onSpin: () => void
  spinning: boolean
}

export default function Handle({ onSpin, spinning }: HandleProps) {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
      <motion.button
        className="relative w-12 h-40 landscape:w-10 landscape:h-32 focus:outline-none disabled:opacity-50"
        whileTap={{ y: 16 }}
        onClick={onSpin}
        disabled={spinning}
      >
        {/* Handle Shaft - metal */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3 h-28 landscape:h-24 bg-gradient-to-b from-zinc-500 to-zinc-700 rounded-full border border-zinc-600" />

        {/* Handle Knob - worn metal */}
        <motion.div
          className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 landscape:w-8 landscape:h-8 bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-full border-2 border-zinc-700 shadow-lg"
          animate={{ y: spinning ? [0, 8, 0] : 0 }}
          transition={{ duration: 0.3, repeat: spinning ? Number.POSITIVE_INFINITY : 0 }}
        />
      </motion.button>
    </div>
  )
}

