'use client'

import React, { useRef, useEffect } from 'react'
import { GameManager } from '@/core/GameManager'
import { useGameSessionStore } from '@/store/gameSessionStore'

// Define props if we need to pass startGame down
interface GameCanvasProps {
  // Optional: Pass function to trigger start from parent
  // requestStartGame: () => void
}

function GameCanvas (props: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameManagerRef = useRef<GameManager | null>(null)
  // Get gameState to potentially control rendering/initialization
  const gameState = useGameSessionStore((state) => state.gameState)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      console.error('Failed to get canvas context')
      return
    }

    // Ensure canvas dimensions match attributes
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Initialize GameManager only once
    if (!gameManagerRef.current) {
      gameManagerRef.current = new GameManager(context)
      console.log('GameManager instance created.')
      // DO NOT start automatically anymore
      // gameManagerRef.current.start()
    }

    // Provide a way to start the game externally (if needed)
    // Example: Expose via ref or use a global event/store action
    // For now, we'll trigger start via a button in page.tsx

    // Cleanup function
    return () => {
      // Ensure loop is stopped on unmount, regardless of game state
      gameManagerRef.current?.stop()
      gameManagerRef.current = null
      console.log('GameManager instance destroyed.')
    }
  }, []) // Empty dependency array

  // Effect to START the game when gameState changes to InProgress
  // This decouples the button click from direct GameManager access
  useEffect(() => {
    if (gameState === 'InProgress' && gameManagerRef.current) {
      console.log('Starting GameManager due to gameState change.')
      gameManagerRef.current.start()
    }
    // Optional: Handle stopping if state changes unexpectedly?
  }, [gameState])

  return (
    <canvas
      ref={canvasRef}
      // Use Tailwind classes for responsive sizing relative to the container
      className='w-full h-full border border-gray-400'
      // Set initial drawing surface size (can be adjusted by useEffect)
      width={800}
      height={450}
    />
  )
}

export { GameCanvas } 