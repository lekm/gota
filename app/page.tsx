'use client' // Need client component for Zustand hook and button onClick

import React, { useRef, useState, useEffect, useCallback } from 'react' // Import useRef, useState, useEffect, useCallback
import { GameCanvas, type GameCanvasHandle } from '@/components/game/GameCanvas'
import { Graventory } from '@/components/ui/Graventory'
import { CombatLog } from '@/components/ui/CombatLog'
import { HeroStatsDisplay } from '@/components/ui/HeroStatsDisplay'
import { SessionInfoDisplay } from '@/components/ui/SessionInfoDisplay'
import { HeroPaperDoll } from '@/components/ui/HeroPaperDoll' // Import Paper Doll
import { useGameSessionStore } from '@/store/gameSessionStore' // Import store hook
import { GameManagerProvider } from '@/hooks/useGameManager' // Keep Provider, remove hook import
import { Button } from "@/components/ui/button"
import type { GameManager } from '@/core/GameManager' // Import GameManager type

// Basic Button component for Nav placeholders
function NavButton ({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors duration-150 text-gray-300">
      {children}
    </button>
  )
}

export default function HomePage() {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const gameCanvasRef = useRef<GameCanvasHandle>(null)
  const gameState = useGameSessionStore((state) => state.gameState)
  
  // State to hold the GameManager instance
  const [gameManagerInstance, setGameManagerInstance] = useState<GameManager | null>(null);

  // Callback for GameCanvas to set the GameManager instance
  // Wrap in useCallback to prevent unnecessary re-renders/effect runs
  const handleGameManagerReady = useCallback((instance: GameManager) => {
    console.log('GameManager instance received in HomePage:', instance);
    setGameManagerInstance(instance);
  }, []); // Empty dependency array means this function reference never changes
  
  // Get manager from state for the button handler
  const gameManagerForButtons = gameManagerInstance; 

  const handleStartGame = () => {
    // Log when the handler is called
    console.log('handleStartGame called'); 
    // Log the instance value at the time of the call
    console.log('gameManagerInstance in handleStartGame:', gameManagerInstance);
    if (gameManagerInstance) {
      console.log('Calling gameManagerInstance.start()');
      gameManagerInstance.start();
    } else {
      console.warn('handleStartGame: gameManagerInstance is null!');
    }
  }

  const handleUseGravy = (gravyId: string) => {
    gameManagerForButtons?.useGravy(gravyId);
  }

  // Effect to observe container size for canvas dimensions
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    // Use ResizeObserver for accurate element size
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        console.log('ResizeObserver triggered. New size:', { width, height }); // Log the size
        setCanvasSize({ width, height });
      }
    });

    resizeObserver.observe(container);

    // Initial size check
    const { clientWidth, clientHeight } = container;
    if (clientWidth > 0 && clientHeight > 0) {
        console.log('Initial container size:', { width: clientWidth, height: clientHeight });
        setCanvasSize({ width: clientWidth, height: clientHeight });
    }

    // Cleanup observer on unmount
    return () => resizeObserver.disconnect();
  }, []); // Empty dependency array, runs once on mount

  // Log the value used for the disabled prop just before returning JSX
  console.log('Rendering HomePage. Is button disabled?: ', !gameManagerInstance);

  return (
    // Wrap the main content area with the Provider
    <GameManagerProvider value={gameManagerInstance}>
      <div className="flex h-screen bg-gray-900 text-white">
        {/* Left Nav Placeholder */}
        <aside className="w-48 border-r border-gray-700 p-4 flex flex-col space-y-2 bg-gray-850">
          <h2 className="text-lg font-semibold mb-2 text-orange-400">Navigation</h2>
          <NavButton>Game</NavButton>
          <NavButton>Hub (Soon)</NavButton>
          <NavButton>Crafting (Soon)</NavButton>
          <div className="flex-grow"></div> {/* Spacer */}
          <NavButton>Settings (Soon)</NavButton>
        </aside>

        {/* Center Content Area */}
        <section className="flex-1 flex flex-col">
          {/* Top Area: Canvas + Log Side-by-Side */} 
          <div className="flex-grow flex flex-row space-x-4 overflow-hidden p-4">
              {/* Left Side: Game Canvas Area */}
              <div ref={canvasContainerRef} className="w-3/4 h-full relative bg-black border border-gray-600 rounded overflow-hidden">
                {canvasSize.width > 0 && canvasSize.height > 0 && (
                  <GameCanvas
                    ref={gameCanvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    onGameManagerReady={handleGameManagerReady}
                  />
                )}
                {/* Start/Stop Button Overlay */} 
                {gameState === 'NotStarted' && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center p-10 text-center z-10">
                    <p className="text-lg mb-4 text-gray-300">
                      Welcome, Chef! Defeat waves of monstrous ingredients before the timer runs out!
                    </p>
                    <p className="text-sm mb-6 text-gray-400">
                      Click &quot;Start Session&quot; to begin. Loot drops appear below. Equip items by clicking &quot;Equip&quot;. Monitor your stats and combat events on the right.
                    </p>
                    <button 
                      onClick={handleStartGame} 
                      disabled={!gameManagerInstance} 
                      className={`px-6 py-3 bg-green-600 text-white font-bold rounded text-xl shadow-lg transition duration-150 ease-in-out ${!gameManagerInstance ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500'}`}
                    >
                      Start Session
                    </button>
                    {!gameManagerInstance && (
                      <p className="text-xs text-gray-400 mt-2 italic">Initializing...</p>
                    )} 
                  </div>
                )}
                {/* Add Session Info Display Overlay */}
                {gameState === 'InProgress' && <SessionInfoDisplay />} 
                {/* Add Game Over Overlay */} 
                {/* {gameState === 'GameOver' && <GameOverDisplay />} */} 
              </div>

              {/* Right Side: Combat Log Area */} 
              <div className="w-1/4 h-full flex flex-col">
                <CombatLog />
              </div>
          </div>

          {/* Bottom: Graventory */} 
          <div className="h-64 flex-shrink-0 border-t border-gray-600 p-4 pt-2 bg-gray-850">
            <Graventory />
          </div>
        </section>

        {/* Right Contextual Sidebar */} 
        <aside className="w-72 border-l border-gray-700 p-4 flex flex-col space-y-4 bg-gray-850">
          {/* Top: Hero Stats & Gravy Buttons */}
          <div className="relative border-b border-gray-600 pb-4 min-h-0 overflow-hidden">
            <HeroStatsDisplay />
            <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col space-y-2">
              <h3 className="text-md font-semibold">Use Gravy:</h3>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => handleUseGravy('gravy_of_zest')}
                disabled={gameState !== 'InProgress' || !gameManagerForButtons} // Also disable if manager not ready
              >
                Use Gravy of Zest
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => handleUseGravy('gravy_of_speed')}
                disabled={gameState !== 'InProgress' || !gameManagerForButtons}
              >
                Use Gravy of Speed
              </Button>
            </div>
          </div>
          {/* Bottom: Hero Paper Doll */}
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <HeroPaperDoll /> 
          </div>
        </aside>
      </div>
    </GameManagerProvider>
  );
}
