"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

export interface TrickTogglesState {
  stances: {
    fakie: boolean
    nollie: boolean
    switch: boolean
  }
  tricks: {
    ollie: boolean
    fs180: boolean
    bs180: boolean
    fsShuv: boolean
    bsShuv: boolean
    kickflip: boolean
    heelflip: boolean
    varialKickflip: boolean
    varialHeelflip: boolean
    hardflip: boolean
    inwardHeelflip: boolean
    fs180Kickflip: boolean
    bs180Kickflip: boolean
    fs180Heelflip: boolean
    bs180Heelflip: boolean
    treFlip: boolean
    impossible: boolean
    fsBigspin: boolean
    bsBigspin: boolean
  }
}

interface TrickTogglesProps {
  onTogglesChange: (toggles: TrickTogglesState) => void
}

export default function TrickToggles({ onTogglesChange }: TrickTogglesProps) {
  const [toggles, setToggles] = useState<TrickTogglesState>({
    stances: { fakie: false, nollie: false, switch: false },
    tricks: {
      ollie: true,
      fs180: true,
      bs180: true,
      fsShuv: true,
      bsShuv: true,
      kickflip: true,
      heelflip: true,
      varialKickflip: false,
      varialHeelflip: false,
      hardflip: false,
      inwardHeelflip: false,
      fs180Kickflip: false,
      bs180Kickflip: false,
      fs180Heelflip: false,
      bs180Heelflip: false,
      treFlip: false,
      impossible: false,
      fsBigspin: false,
      bsBigspin: false,
    },
  })

  const allStances = ["fakie", "nollie", "switch"]
  const allBasicTricks = ["fs180", "bs180", "fsShuv", "bsShuv", "kickflip", "heelflip"]
  const allAdvancedTricks = [
    "varialKickflip", "varialHeelflip", "hardflip", "inwardHeelflip",
    "fs180Kickflip", "bs180Kickflip", "fs180Heelflip", "bs180Heelflip",
    "treFlip", "impossible", "fsBigspin", "bsBigspin"
  ]

  const isAllSelected = (keys: string[], category: keyof TrickTogglesState) =>
    keys.every((key) => (category === "stances"
      ? toggles.stances[key as keyof typeof toggles.stances]
      : toggles.tricks[key as keyof typeof toggles.tricks]))

  const handleSelectAll = (category: keyof TrickTogglesState, keys: string[], value: boolean) => {
    setToggles((prev) => {
      const updated = { ...prev, [category]: { ...prev[category] } }
      keys.forEach((key) => {
        if (category === "stances") {
          (updated.stances as any)[key] = value
        } else {
          (updated.tricks as any)[key] = value
        }
      })
      onTogglesChange(updated)
      return updated
    })
  }

  const handleToggleChange = (category: keyof TrickTogglesState, name: string) => {
    setToggles((prev) => {
      const newToggles = {
        ...prev,
        [category]: {
          ...prev[category],
          [name]: !prev[category][name as keyof typeof prev[typeof category]],
        },
      }
      onTogglesChange(newToggles)
      return newToggles
    })
  }

  const [openSections, setOpenSections] = useState({
    stance: false,
    basic: false,
    advanced: false,
  })

  const toggleSection = (section: 'stance' | 'basic' | 'advanced') => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const trickLabels: Record<string, string> = {
    fs180: "FS 180", bs180: "BS 180", fsShuv: "FS Shuv", bsShuv: "BS Shuv",
    kickflip: "Kickflip", heelflip: "Heelflip",
    varialKickflip: "Varial Kickflip", varialHeelflip: "Varial Heelflip",
    hardflip: "Hardflip", inwardHeelflip: "Inward Heelflip",
    fs180Kickflip: "FS 180 Kickflip", bs180Kickflip: "BS 180 Kickflip",
    fs180Heelflip: "FS 180 Heelflip", bs180Heelflip: "BS 180 Heelflip",
    treFlip: "Tre Flip", impossible: "Impossible",
    fsBigspin: "FS Bigspin", bsBigspin: "BS Bigspin",
  }

  const SectionHeader = ({
    label,
    section,
    allKeys,
    category,
  }: {
    label: string
    section: 'stance' | 'basic' | 'advanced'
    allKeys: string[]
    category: keyof TrickTogglesState
  }) => (
    <button
      type="button"
      className="flex items-center w-full py-2 px-1 rounded-lg hover:bg-white/[0.03] transition-colors group"
      onClick={() => toggleSection(section)}
    >
      {openSections[section]
        ? <ChevronDown className="w-4 h-4 text-zinc-500 mr-2 group-hover:text-zinc-300 transition-colors" />
        : <ChevronRight className="w-4 h-4 text-zinc-500 mr-2 group-hover:text-zinc-300 transition-colors" />
      }
      <span className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">{label}</span>
      <label className="ml-auto flex items-center" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isAllSelected(allKeys, category)}
          onChange={e => handleSelectAll(category, allKeys, e.target.checked)}
          className="h-4 w-4 rounded border-zinc-600 cursor-pointer"
        />
      </label>
    </button>
  )

  const ToggleItem = ({
    label,
    checked,
    onChange,
  }: {
    label: string
    checked: boolean
    onChange: () => void
  }) => (
    <label className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-zinc-600 cursor-pointer shrink-0"
      />
      <span className={`text-sm transition-colors ${checked ? "text-white" : "text-zinc-500"}`}>{label}</span>
    </label>
  )

  return (
    <div className="space-y-3">
      {/* Stances */}
      <div>
        <SectionHeader label="Stance" section="stance" allKeys={allStances} category="stances" />
        {openSections.stance && (
          <div className="flex flex-wrap gap-1 mt-1 pl-6">
            {(["fakie", "nollie", "switch"] as const).map((key) => (
              <ToggleItem
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                checked={toggles.stances[key]}
                onChange={() => handleToggleChange("stances", key)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Basic */}
      <div>
        <SectionHeader label="Basic Moves" section="basic" allKeys={allBasicTricks} category="tricks" />
        {openSections.basic && (
          <div className="grid grid-cols-2 gap-0.5 mt-1 pl-4">
            {allBasicTricks.map((key) => (
              <ToggleItem
                key={key}
                label={trickLabels[key]}
                checked={toggles.tricks[key as keyof typeof toggles.tricks]}
                onChange={() => handleToggleChange("tricks", key)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Advanced */}
      <div>
        <SectionHeader label="Advanced Moves" section="advanced" allKeys={allAdvancedTricks} category="tricks" />
        {openSections.advanced && (
          <div className="grid grid-cols-2 gap-0.5 mt-1 pl-4 max-h-52 overflow-y-auto">
            {allAdvancedTricks.map((key) => (
              <ToggleItem
                key={key}
                label={trickLabels[key]}
                checked={toggles.tricks[key as keyof typeof toggles.tricks]}
                onChange={() => handleToggleChange("tricks", key)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
