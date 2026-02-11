"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useMemo } from "react"
import { TrickTogglesState } from "./TrickToggles"

interface ReelProps {
  spinning: boolean
  result: string
  delay: number
  trickToggles: TrickTogglesState
}

const generateTrickNames = (toggles: TrickTogglesState): string[] => {
  const names: string[] = []
  const stances = ["Regular"]
  if (toggles.stances.fakie) stances.push("Fakie")
  if (toggles.stances.nollie) stances.push("Nollie")
  if (toggles.stances.switch) stances.push("Switch")

  const tricks: { [key: string]: string } = {
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

  // Generate combinations of stances and tricks
  stances.forEach((stance) => {
    Object.entries(tricks).forEach(([key, trick]) => {
      if (toggles.tricks[key as keyof typeof toggles.tricks]) {
        // Special rule: Nollie stance + Ollie trick => show only 'Nollie'
        if (stance === "Nollie" && trick === "Ollie") {
          names.push("Nollie")
        } else if (stance === "Regular") {
          names.push(trick)
        } else {
          names.push(`${stance} ${trick}`)
        }
      }
    })
  })

  return names
}

export default function Reel({ spinning, result, delay, trickToggles }: ReelProps) {
  const displayedNames = useMemo(() => generateTrickNames(trickToggles), [trickToggles])
  const [currentNames, setCurrentNames] = useState(displayedNames)

  useEffect(() => {
    setCurrentNames(displayedNames)
  }, [displayedNames])

  useEffect(() => {
    if (spinning) {
      const interval = setInterval(() => {
        setCurrentNames((prevNames) => {
          // If we have less than 2 unique tricks, allow repeats
          if (displayedNames.length < 2) {
            const newNames = [...prevNames]
            newNames.unshift(newNames.pop()!)
            return newNames
          }

          // Otherwise, ensure no duplicates in the visible 3 tricks
          const newNames = [...prevNames]
          const lastTrick = newNames.pop()!
          
          // Get the current visible tricks
          const visibleTricks = newNames.slice(0, 2)
          
          // Filter out tricks that are already visible
          let availableTricks = displayedNames.filter(trick => !visibleTricks.includes(trick))
          
          // If no unique tricks available, fall back to any trick
          if (availableTricks.length === 0) {
            availableTricks = displayedNames
          }
          
          // Randomly select from available tricks
          const randomIndex = Math.floor(Math.random() * availableTricks.length)
          newNames.unshift(availableTricks[randomIndex])
          
          return newNames
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [spinning, displayedNames])

  return (
    <div className="w-full h-16 sm:h-32 landscape:h-14 min-h-[3.5rem] bg-zinc-900/80 rounded-sm overflow-hidden border border-zinc-600 flex items-center justify-center">
      <motion.div
        className="h-full w-full flex flex-col items-center justify-center"
        initial={{ y: 0 }}
        animate={spinning ? { y: [0, -1000, 0] } : { y: 0 }}
        transition={{
          y: { duration: delay, ease: "easeInOut" },
        }}
      >
        {currentNames.slice(0, 3).map((name, index) => (
          <motion.span
            key={index}
            className={`font-semibold ${index === 1 ? "text-base sm:text-2xl landscape:text-sm text-zinc-200" : "text-sm sm:text-xl landscape:text-xs text-zinc-500/60"}`}
            style={{ minHeight: '1.4em', lineHeight: 1.2, textAlign: 'center', width: '100%' }}
            initial={{ y: spinning ? 28 : 0 }}
            animate={{ y: spinning ? -28 : 0 }}
            transition={{ duration: 0.1, repeat: spinning ? Number.POSITIVE_INFINITY : 0, repeatType: "loop" }}
          >
            {spinning ? name : index === 1 ? result : ""}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}

