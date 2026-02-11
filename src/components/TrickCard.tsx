"use client"

import { motion } from "framer-motion"

export interface TrickCardProps {
  result: string
  spinning: boolean
  index: number
}

/* Red skateboard SVG for spinning animations */
function SkateboardSVG() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Deck */}
      <rect x="4" y="14" width="28" height="6" rx="3" fill="#ef4444" />
      {/* Grip tape stripe */}
      <rect x="6" y="15" width="24" height="4" rx="2" fill="#b91c1c" />
      {/* Left wheel */}
      <circle cx="10" cy="23" r="3" fill="#dc2626" />
      <circle cx="10" cy="23" r="1.5" fill="#991b1b" />
      {/* Right wheel */}
      <circle cx="26" cy="23" r="3" fill="#dc2626" />
      <circle cx="26" cy="23" r="1.5" fill="#991b1b" />
      {/* Left truck */}
      <rect x="7" y="20" width="6" height="2" rx="1" fill="#b91c1c" />
      {/* Right truck */}
      <rect x="23" y="20" width="6" height="2" rx="1" fill="#b91c1c" />
    </svg>
  )
}

/* Panel 0 — Shuv-it: board rotates 360 flat (rotateY) without flipping */
function ShuvItAnimation() {
  return (
    <div className="flex items-center justify-center gap-3">
      <motion.div
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
        style={{ perspective: 200 }}
      >
        <SkateboardSVG />
      </motion.div>
      <span className="text-sm trick-text opacity-80">Spinning</span>
    </div>
  )
}

/* Panel 1 — Kickflip: board rotates flat (rotate Z) */
function KickflipSpinAnimation() {
  return (
    <div className="flex items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
      >
        <SkateboardSVG />
      </motion.div>
      <span className="text-sm trick-text opacity-80">Spinning</span>
    </div>
  )
}

/* Panel 2 — Sideways flip: board flips on X axis (like the original randomizer) */
function SideflipAnimation() {
  return (
    <div className="flex items-center justify-center gap-3">
      <motion.div
        animate={{ rotateX: [0, 360] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        style={{ perspective: 200 }}
      >
        <SkateboardSVG />
      </motion.div>
      <span className="text-sm trick-text opacity-80">Spinning</span>
    </div>
  )
}

/* Small transparent red skateboard rolling along the bottom */
function RollingSkateboard({ variant, speed }: { variant: "shuvit" | "kickflip" | "sideflip"; speed: number }) {
  const animationName =
    variant === "shuvit"
      ? "skate-roll-shuvit"
      : variant === "kickflip"
        ? "skate-roll-kickflip"
        : "skate-roll-sideflip"

  return (
    <div
      className="absolute bottom-1 pointer-events-none"
      style={{
        animation: `${animationName} ${speed}s linear infinite`,
        left: "-20px",
      }}
    >
      <svg
        width="30"
        height="12"
        viewBox="0 0 30 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.5 }}
      >
        {/* Deck */}
        <rect x="2" y="2" width="26" height="4" rx="2" fill="rgba(239,68,68,0.4)" />
        {/* Left wheel */}
        <circle cx="8" cy="9" r="2.5" fill="rgba(239,68,68,0.35)" stroke="rgba(239,68,68,0.2)" strokeWidth="0.5">
          <animateTransform attributeName="transform" type="rotate" from="0 8 9" to="360 8 9" dur="0.4s" repeatCount="indefinite" />
        </circle>
        {/* Right wheel */}
        <circle cx="22" cy="9" r="2.5" fill="rgba(239,68,68,0.35)" stroke="rgba(239,68,68,0.2)" strokeWidth="0.5">
          <animateTransform attributeName="transform" type="rotate" from="0 22 9" to="360 22 9" dur="0.4s" repeatCount="indefinite" />
        </circle>
        {/* Left truck */}
        <rect x="5" y="6" width="6" height="1.5" rx="0.75" fill="rgba(239,68,68,0.25)" />
        {/* Right truck */}
        <rect x="19" y="6" width="6" height="1.5" rx="0.75" fill="rgba(239,68,68,0.25)" />
      </svg>
    </div>
  )
}

const PANEL_CONFIG: { variant: "shuvit" | "kickflip" | "sideflip"; speed: number }[] = [
  { variant: "shuvit",   speed: 3.5 },  // top — fastest
  { variant: "kickflip", speed: 4.5 },  // middle — medium
  { variant: "sideflip", speed: 5.5 },  // bottom — slowest
]

export default function TrickCard({
  result,
  spinning,
  index,
}: TrickCardProps) {
  const { variant, speed } = PANEL_CONFIG[index] ?? PANEL_CONFIG[2]

  // Each panel gets its matching spinning animation
  const SpinAnimation =
    index === 0 ? ShuvItAnimation : index === 1 ? KickflipSpinAnimation : SideflipAnimation

  return (
    <motion.div
      layout
      className="trick-panel gradient-flow relative flex items-center justify-center min-h-[64px] px-4 pt-3 pb-5 transition-all duration-200"
    >
      {/* Content */}
      {spinning ? (
        <SpinAnimation />
      ) : result ? (
        <p className="trick-text-gold font-bold text-2xl sm:text-3xl text-center leading-tight tracking-wide uppercase">{result}</p>
      ) : (
        <span className="text-sm trick-text opacity-50">Press Spin</span>
      )}

      {/* Rolling skateboard along the bottom */}
      <RollingSkateboard variant={variant} speed={speed} />
    </motion.div>
  )
}
