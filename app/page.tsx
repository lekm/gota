'use client' // Need client component for Zustand hook and button onClick

import React, { useRef } from 'react' // Import useRef
import Image from "next/image";
import { GameCanvas, type GameCanvasHandle } from '@/components/game/GameCanvas'
import { Graventory } from '@/components/ui/Graventory'
import { CombatLog } from '@/components/ui/CombatLog'
import { HeroStatsDisplay } from '@/components/ui/HeroStatsDisplay'
import { SessionInfoDisplay } from '@/components/ui/SessionInfoDisplay'
import { GameOverDisplay } from '@/components/ui/GameOverDisplay' // Import GameOverDisplay
import { HeroPaperDoll } from '@/components/ui/HeroPaperDoll' // Import Paper Doll
import { useGameSessionStore } from '@/store/gameSessionStore' // Import store hook

// Basic Button component for Nav placeholders
function NavButton ({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors duration-150 text-gray-300">
      {children}
    </button>
  )
}

export default function HomePage() {
  // Get game state and the action to change it
  const gameState = useGameSessionStore((state) => state.gameState)
  const gameCanvasRef = useRef<GameCanvasHandle>(null) // Create ref for GameCanvas

  const handleStartGame = () => {
    console.log('Start Game button clicked')
    // Directly call the exposed method on the canvas ref
    if (gameCanvasRef.current) {
      gameCanvasRef.current.startGame()
    } else {
      console.error('GameCanvas ref not available to start game.');
    }
  }

  return (
    // This outer div replaces the old <main>, acting as the primary flex container
    <div className="flex flex-grow bg-gray-800 text-gray-100 border border-gray-700 rounded shadow-lg overflow-hidden">
      
      {/* Left Nav Sidebar */}
      <aside className="w-48 border-r border-gray-700 p-4 flex flex-col space-y-2 bg-gray-850">
        <h2 className="text-lg font-semibold mb-2 text-orange-400">Navigation</h2>
        <NavButton>Game</NavButton>
        <NavButton>Hub (Soon)</NavButton>
        <NavButton>Crafting (Soon)</NavButton>
        <div className="flex-grow"></div> {/* Spacer */}
        <NavButton>Settings (Soon)</NavButton>
      </aside>

      {/* Main Game Window (Center) */}
      <section className="flex-grow flex flex-col p-4 bg-gray-900">
        {/* Combined Game Area + Combat Log Container - Add h-0 */}
        <div id="game-and-log-container" className="flex-grow flex flex-row space-x-4 overflow-hidden mb-4 h-0">
          
          {/* Left Side: Game Canvas Area - Keep aspect-video */}
          <div id="game-canvas-container" className="relative w-3/4 aspect-video bg-black border border-gray-600 flex flex-col items-center justify-center overflow-hidden rounded">
            {/* Session Info Overlay */} 
            {gameState === 'InProgress' && <SessionInfoDisplay />}
            
            {/* Instructions / Start Button Overlay */} 
            {gameState === 'NotStarted' && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center p-10 text-center z-10">
                <p className="text-lg mb-4 text-gray-300">
                  Welcome, Chef! Defeat waves of monstrous ingredients before the timer runs out!
                </p>
                <p className="text-sm mb-6 text-gray-400">
                  Click "Start Session" to begin. Loot drops appear below. Equip items by clicking "Equip". Monitor your stats and combat events on the right.
                </p>
                <button onClick={handleStartGame} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded text-xl shadow-lg transition duration-150 ease-in-out">
                  Start Session
                </button>
              </div>
            )}
            
            {/* Game Canvas */} 
            {(gameState === 'InProgress' || gameState === 'GameOver' || gameState === 'NotStarted') && (
              <GameCanvas ref={gameCanvasRef} />
            )}
            
            {/* Game Over Overlay */} 
            {gameState === 'GameOver' && <GameOverDisplay />}
          </div>

          {/* Right Side: Combat Log Area - Keep h-full */}
          <div className="w-1/4 flex flex-col h-full">
            <CombatLog />
          </div>

        </div>
        
        {/* Bottom: Graventory - Keep mt-auto and fixed height */}
        <div className="h-48 flex-shrink-0 border-t border-gray-600 mt-auto pt-2"> 
          <Graventory />
        </div>
      </section>

      {/* Right Contextual Sidebar */}
      <aside className="w-72 border-l border-gray-700 p-4 flex flex-col space-y-4 bg-gray-850">
        {/* Top: Hero Stats */}
        <div className="relative flex-1 border-b border-gray-600 pb-4 min-h-0 overflow-hidden">
          <HeroStatsDisplay />
        </div>
        {/* Bottom: Hero Paper Doll */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          <HeroPaperDoll /> {/* Place Paper Doll here */}
        </div>
      </aside>
    </div>
  );
}
