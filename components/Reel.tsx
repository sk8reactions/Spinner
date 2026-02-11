"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface ReelProps {
  spinning: boolean
  result: string
  delay: number
}

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

export default function Reel({ spinning, result, delay }: ReelProps) {
  const [displayedNames, setDisplayedNames] = useState(names)

  useEffect(() => {
    if (spinning) {
      const interval = setInterval(() => {
        setDisplayedNames((prevNames) => {
          const newNames = [...prevNames]
          newNames.unshift(newNames.pop()!)
          return newNames
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [spinning])

  return (
    <div className="w-full h-32 bg-gradient-to-b from-yellow-900/20 to-yellow-900/40 rounded-lg overflow-hidden border-2 border-yellow-500">
      <motion.div
        className="h-full flex flex-col items-center justify-center"
        initial={{ y: 0 }}
        animate={spinning ? { y: [0, -1000, 0] } : { y: 0 }}
        transition={{
          y: { duration: delay, ease: "easeInOut" },
        }}
      >
        {displayedNames.slice(0, 3).map((name, index) => (
          <motion.span
            key={index}
            className={`text-2xl font-bold ${index === 1 ? "text-yellow-500" : "text-yellow-300/50"}`}
            initial={{ y: spinning ? 32 : 0 }}
            animate={{ y: spinning ? -32 : 0 }}
            transition={{ duration: 0.1, repeat: spinning ? Number.POSITIVE_INFINITY : 0, repeatType: "loop" }}
          >
            {spinning ? name : index === 1 ? result : ""}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}

