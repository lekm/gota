'use client'

import React from 'react'
import { useGameSessionStore } from '@/store/gameSessionStore'

function SessionInfoDisplay () {
  const waveNumber = useGameSessionStore((state) => state.waveNumber)
  const timeRemaining = useGameSessionStore((state) => state.timeRemaining)
  const isGameOver = useGameSessionStore((state) => state.isGameOver)
  const heroLevel = useGameSessionStore((state) => state.heroLevel)
  const heroXPInfo = useGameSessionStore((state) => state.heroXPInfo)

  // Calculate XP percentage
  const xpPercentage = heroXPInfo && heroXPInfo.xpToNextLevel > 0
    ? (heroXPInfo.currentXP / heroXPInfo.xpToNextLevel) * 100
    : 0

  return (
    <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-60 p-2 z-10 pointer-events-none">
      <div className="flex justify-between items-center text-white mb-1">
        {/* Left Side: Hero Level */}
        <div>
          <span className="font-bold">Hero Level: {heroLevel > 0 ? heroLevel : '-'}</span>
        </div>
        {/* Right Side: Wave and Timer */}
        <div className="flex items-center">
          <span className="font-bold mr-4">Wave: {waveNumber > 0 ? waveNumber : '-'}</span>
          <span className={`font-bold ${timeRemaining < 10 && !isGameOver ? 'text-red-500' : ''}`}>
            Time: {timeRemaining > 0 || waveNumber > 0 ? Math.ceil(timeRemaining) : '--'}s
          </span>
        </div>
      </div>
      {/* XP Bar Container */}
      {heroXPInfo && (
        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
          {/* XP Bar Fill */}
          <div 
            className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${xpPercentage}%` }} 
          />
        </div>
      )}
    </div>
  )
}

export { SessionInfoDisplay } 