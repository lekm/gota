'use client' // Need client component for Zustand hook and button onClick

import React from 'react' // Import React
import Image from "next/image";
import { GameCanvas } from '@/components/game/GameCanvas'
import { Graventory } from '@/components/ui/Graventory'
import { CombatLog } from '@/components/ui/CombatLog'
import { HeroStatsDisplay } from '@/components/ui/HeroStatsDisplay'
import { SessionInfoDisplay } from '@/components/ui/SessionInfoDisplay'
import { CraftingStation } from '@/components/ui/CraftingStation'
import { GameOverDisplay } from '@/components/ui/GameOverDisplay' // Import GameOverDisplay
import { useGameSessionStore } from '@/store/gameSessionStore' // Import store hook

export default function HomePage() {
  // Get game state and the action to change it
  const gameState = useGameSessionStore((state) => state.gameState)
  const setGameState = useGameSessionStore((state) => state.setGameState)

  const handleStartGame = () => {
    console.log('Start Game button clicked')
    setGameState('InProgress') // Trigger game start via state change
  }

  return (
    <main className="flex h-screen bg-gray-900 text-gray-100">
      {/* Left Sidebar - Graventory, Crafting Stub */}
      <aside className="w-1/5 border-r border-gray-700 p-4 flex flex-col">
        <div className="h-3/5 border-b mb-4 pb-4">
          <Graventory />
        </div>
        <div className="h-2/5">
          <CraftingStation />
        </div>
      </aside>

      {/* Center Area - Game Canvas */}
      <section className="relative flex-grow flex flex-col items-center justify-center border-r border-gray-700 p-4">
        {/* Session Info Overlay - Render only when game is in progress */}
        {gameState === 'InProgress' && <SessionInfoDisplay />}

        <h1 className="text-3xl font-bold mb-4 text-orange-400">Gravies of the Ancients</h1>
        {/* Game Area Container */}
        <div id="game-canvas-container" className="relative w-full aspect-video bg-black border border-gray-600 flex items-center justify-center overflow-hidden">
          {/* Conditionally render Canvas or Start Button */}
          {gameState === 'NotStarted' && (
            <button
              onClick={handleStartGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded text-xl shadow-lg transition duration-150 ease-in-out"
            >
              Start Session
            </button>
          )}
          {/* Game Canvas - Render even on Game Over so it stays behind overlay */}
          {(gameState === 'InProgress' || gameState === 'GameOver') && (
            <GameCanvas />
          )}
          {/* Game Over Overlay */}
          {gameState === 'GameOver' && <GameOverDisplay />}
        </div>
      </section>

      {/* Right Sidebar - Stats, Combat Log */}
      <aside className="w-1/5 border-l border-gray-700 p-4 flex flex-col">
        <div className="h-1/2 border-b mb-4 pb-4">
          <HeroStatsDisplay />
        </div>
        <div className="h-1/2">
          <CombatLog />
        </div>
      </aside>
    </main>
  );
}
