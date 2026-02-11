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
        className="relative w-16 h-48 focus:outline-none disabled:opacity-50"
        whileTap={{ y: 20 }}
        onClick={onSpin}
        disabled={spinning}
      >
        {/* Handle Shaft */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-4 h-32 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-full" />

        {/* Handle Knob */}
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full border-4 border-yellow-700 shadow-lg"
          animate={{ y: spinning ? [0, 10, 0] : 0 }}
          transition={{ duration: 0.3, repeat: spinning ? Number.POSITIVE_INFINITY : 0 }}
        />
      </motion.button>
    </div>
  )
}

