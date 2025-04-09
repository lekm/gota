'use client'

import React from 'react'
import { useGameSessionStore } from '@/store/gameSessionStore'

function HeroStatsDisplay () {
  const heroStats = useGameSessionStore((state) => state.heroStats)

  if (!heroStats) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Hero Stats</h2>
        <p className="text-gray-400 italic">No hero active...</p>
      </div>
    )
  }

  // Map internal stat names to display names
  const statDisplayNames: { [key in keyof typeof heroStats]?: string } = {
    health: 'Health',
    maxHealth: 'Max Health',
    damage: 'Damage',
    attackSpeed: 'Attack Speed',
    defense: 'Defense'
    // Add mappings for zest, vigor, etc. when implemented
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Hero Stats</h2>
      <ul className="text-sm space-y-1">
        {Object.entries(heroStats).map(([key, value]) => {
          const displayName = statDisplayNames[key as keyof typeof heroStats]
          if (!displayName) return null // Don't display unknown stats

          // Format specific stats (e.g., health, speed)
          let displayValue = value
          if (key === 'health') {
            displayValue = `${value} / ${heroStats.maxHealth}`
          } else if (key === 'maxHealth') {
            return null // Hide maxHealth as it's shown with health
          } else if (key === 'attackSpeed') {
            displayValue = `${value.toFixed(2)}/s`
          }

          return (
            <li key={key} className="flex justify-between">
              <span>{displayName}:</span>
              <span className="font-medium">{displayValue}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { HeroStatsDisplay } 