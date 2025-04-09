'use client'

import React from 'react'
import { useGameSessionStore } from '@/store/gameSessionStore'

function SessionInfoDisplay () {
  const waveNumber = useGameSessionStore((state) => state.waveNumber)
  const timeRemaining = useGameSessionStore((state) => state.timeRemaining)
  const isGameOver = useGameSessionStore((state) => state.isGameOver)

  return (
    <div className="absolute top-2 left-2 right-2 flex justify-between text-white bg-black bg-opacity-50 p-2 rounded z-10 pointer-events-none">
      <span className="font-bold">Wave: {waveNumber > 0 ? waveNumber : '-'}</span>
      <span className={`font-bold ${timeRemaining < 10 && !isGameOver ? 'text-red-500' : ''}`}>
        Time: {timeRemaining > 0 || waveNumber > 0 ? Math.ceil(timeRemaining) : '--'}s
      </span>
    </div>
  )
}

export { SessionInfoDisplay } 