'use client'

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { GameManager } from '@/core/GameManager'
// Remove gameState listener import, no longer needed here
// import { useGameSessionStore } from '@/store/gameSessionStore' 

// Define the type for the exposed methods
export interface GameCanvasHandle {
  startGame: () => void
}

// Use forwardRef to receive the ref from the parent
const GameCanvas = forwardRef<GameCanvasHandle, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameManagerRef = useRef<GameManager | null>(null)

  // Expose the startGame method via the ref
  useImperativeHandle(ref, () => ({
    startGame: () => {
      if (gameManagerRef.current) {
        console.log('startGame called via ref, attempting to start GameManager...');
        gameManagerRef.current.start() // Call start on the instance
      } else {
        console.error('Attempted to start game before GameManager instance was ready.');
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      console.error('Failed to get canvas context')
      return
    }

    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Initialize GameManager only once
    if (!gameManagerRef.current) {
      gameManagerRef.current = new GameManager(context)
      console.log('GameManager instance created.')
    }

    // Cleanup function
    return () => {
      gameManagerRef.current?.stop()
      gameManagerRef.current = null
      console.log('GameManager instance destroyed.')
    }
  }, [])

  // Remove the useEffect that listened to gameState
  // useEffect(() => {
  //   ...
  // }, [gameState])

  return (
    <canvas
      ref={canvasRef}
      className='w-full h-full border border-gray-400'
      width={800}
      height={450}
    />
  )
})

// Add display name for DevTools
GameCanvas.displayName = 'GameCanvas'

export { GameCanvas } 