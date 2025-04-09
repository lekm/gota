'use client'

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { GameManager } from '@/core/GameManager'
// Remove gameState listener import, no longer needed here
// import { useGameSessionStore } from '@/store/gameSessionStore' 

// Define props for GameCanvas
interface GameCanvasProps {
  width: number;
  height: number;
  onGameManagerReady: (instance: GameManager) => void; // Callback prop
}

// Define the type for the exposed methods
export interface GameCanvasHandle {
  // Expose stopGame as well if needed
  startGame: () => void;
  stopGame: () => void; 
}

// Use forwardRef with props
const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameManagerRef = useRef<GameManager | null>(null)

  // Expose methods via the ref
  useImperativeHandle(ref, () => ({
    startGame: () => {
      if (gameManagerRef.current) {
        gameManagerRef.current.start()
      } else {
        console.error('Attempted to start game before GameManager was ready.');
      }
    },
    stopGame: () => {
      if (gameManagerRef.current) {
         gameManagerRef.current.stop()
         // State change should be handled by caller if needed
      } else {
        console.error('Attempted to stop game before GameManager was ready.');
      }
    }
  }));

  useEffect(() => {
    console.log('GameCanvas useEffect running. Width:', props.width, 'Height:', props.height);
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      console.error('GameCanvas: Failed to get canvas context!');
      return
    }
    console.log('GameCanvas: Context obtained.');

    canvas.width = props.width
    canvas.height = props.height

    if (!gameManagerRef.current) {
      console.log('GameCanvas: Instantiating GameManager...');
      const instance = new GameManager(context)
      gameManagerRef.current = instance
      console.log('GameCanvas: GameManager instance created:', instance);
      console.log('GameCanvas: Calling onGameManagerReady callback...');
      props.onGameManagerReady(instance);
    } else {
      console.log('GameCanvas: GameManager instance already exists.');
    }

    // Cleanup function
    return () => {
      gameManagerRef.current?.stop()
      // No need to nullify here, instance persists until component unmounts
      // gameManagerRef.current = null
      console.log('GameCanvas cleanup running (GameManager stop called).')
    }
    // Depend on props that influence canvas/manager setup
  }, [props.width, props.height, props.onGameManagerReady])

  // Remove the useEffect that listened to gameState
  // useEffect(() => {
  //   ...
  // }, [gameState])

  return (
    <canvas
      ref={canvasRef}
      className='w-full h-full border border-gray-400'
      // Width/height attributes set dynamically by useEffect
    />
  )
})

// Add display name for DevTools
GameCanvas.displayName = 'GameCanvas'

export { GameCanvas } 