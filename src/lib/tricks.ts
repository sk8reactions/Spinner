/**
 * Trick metadata for difficulty (1–5), style tags, and display.
 * difficulty: 1 = chill, 5 = tech
 */
export const TRICK_META: Record<string, { displayName: string; difficulty: number; styleTags: string[] }> = {
  ollie: { displayName: "Ollie", difficulty: 1, styleTags: ["clean", "stomp"] },
  fs180: { displayName: "FS 180", difficulty: 2, styleTags: ["clean", "floaty"] },
  bs180: { displayName: "BS 180", difficulty: 2, styleTags: ["clean", "sketchy"] },
  fsShuv: { displayName: "FS Shuv", difficulty: 2, styleTags: ["clean", "stomp"] },
  bsShuv: { displayName: "BS Shuv", difficulty: 2, styleTags: ["clean", "floaty"] },
  kickflip: { displayName: "Kickflip", difficulty: 3, styleTags: ["clean", "stomp"] },
  heelflip: { displayName: "Heelflip", difficulty: 3, styleTags: ["clean", "sketchy"] },
  varialKickflip: { displayName: "Varial Kickflip", difficulty: 4, styleTags: ["tech", "stomp"] },
  varialHeelflip: { displayName: "Varial Heelflip", difficulty: 4, styleTags: ["tech", "floaty"] },
  hardflip: { displayName: "Hardflip", difficulty: 5, styleTags: ["tech", "sketchy"] },
  inwardHeelflip: { displayName: "Inward Heelflip", difficulty: 5, styleTags: ["tech", "stomp"] },
  fs180Kickflip: { displayName: "FS 180 Kickflip", difficulty: 5, styleTags: ["tech", "floaty"] },
  bs180Kickflip: { displayName: "BS 180 Kickflip", difficulty: 5, styleTags: ["tech", "stomp"] },
  fs180Heelflip: { displayName: "FS 180 Heelflip", difficulty: 5, styleTags: ["tech", "sketchy"] },
  bs180Heelflip: { displayName: "BS 180 Heelflip", difficulty: 5, styleTags: ["tech", "floaty"] },
  treFlip: { displayName: "Tre Flip", difficulty: 5, styleTags: ["tech", "stomp"] },
  impossible: { displayName: "Impossible", difficulty: 5, styleTags: ["tech", "floaty"] },
  fsBigspin: { displayName: "FS Bigspin", difficulty: 5, styleTags: ["tech", "sketchy"] },
  bsBigspin: { displayName: "BS Bigspin", difficulty: 5, styleTags: ["tech", "floaty"] },
}

const STYLE_TAGS = ["clean", "sketchy", "stomp", "floaty", "tech"] as const
const ATTEMPT_RULES = ["3 tries max", "first try counts", "best of 5", "one and done"]

/** Infer stance from trick display name (e.g. "Fakie BS 180" -> Fakie) */
export function getStanceFromTrickName(name: string): string {
  if (/^Fakie\s/i.test(name) || name === "Fakie Pop") return "Fakie"
  if (/^Nollie\s/i.test(name) || name === "Nollie") return "Nollie"
  if (/^Switch\s/i.test(name) || name === "Switch Pop") return "Switch"
  return "Regular"
}

/** Get a random style tag for a trick (for overlay/caption) */
export function getStyleTagForTrick(trickKey: string): string {
  const meta = TRICK_META[trickKey]
  if (meta?.styleTags?.length) return meta.styleTags[Math.floor(Math.random() * meta.styleTags.length)]
  return STYLE_TAGS[Math.floor(Math.random() * STYLE_TAGS.length)]
}

/** Get difficulty 1–5 for a trick name (match by displayName or key) */
export function getDifficultyForTrick(trickName: string): number {
  const normalized = trickName.replace(/^(Regular|Fakie|Nollie|Switch)\s+/, "").trim()
  for (const [, meta] of Object.entries(TRICK_META)) {
    if (meta.displayName === normalized) return meta.difficulty
  }
  if (trickName === "Ollie" || trickName === "Nollie") return 1
  return 3
}

/** Random attempt rule for overlay */
export function getAttemptRule(): string {
  return ATTEMPT_RULES[Math.floor(Math.random() * ATTEMPT_RULES.length)]
}

/** Prebuilt packs: which trick keys are in each pack */
export const PACKS = {
  Beginner: ["ollie", "fs180", "bs180", "fsShuv", "bsShuv", "kickflip", "heelflip"],
  Street: ["ollie", "fs180", "bs180", "fsShuv", "bsShuv", "kickflip", "heelflip", "varialKickflip", "varialHeelflip", "treFlip"],
  Tech: ["varialKickflip", "varialHeelflip", "hardflip", "inwardHeelflip", "fs180Kickflip", "bs180Kickflip", "fs180Heelflip", "bs180Heelflip", "treFlip", "impossible", "fsBigspin", "bsBigspin"],
  Flatground: ["ollie", "fs180", "bs180", "fsShuv", "bsShuv", "kickflip", "heelflip", "varialKickflip", "varialHeelflip", "hardflip", "inwardHeelflip", "treFlip"],
  Ledge: ["ollie", "fs180", "bs180", "kickflip", "heelflip", "varialKickflip", "varialHeelflip", "bs180Kickflip", "bs180Heelflip", "treFlip"],
} as const

/** Challenge modes with title and optional pack preset */
export const CHALLENGES = [
  { id: "drone", title: "Drone Line Challenge", pack: "Street" as const },
  { id: "beginner", title: "Beginner Glow-Up", pack: "Beginner" as const },
  { id: "tech", title: "Tech Tuesday", pack: "Tech" as const },
  { id: "nocomply", title: "No-Comply Roulette", pack: "Street" as const },
] as const
