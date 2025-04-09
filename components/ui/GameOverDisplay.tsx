'use client'

import React from 'react'
import { useGameSessionStore } from '@/store/gameSessionStore'
import { useInventoryStore } from '@/store/inventoryStore'
import { Equipment } from '@/core/items/Equipment'
import { Item } from '@/core/items/Item'

function GameOverDisplay () {
  const { gameState, gameOverReason, waveNumber, resetSession, setGameState } = useGameSessionStore((state) => state)
  const finalLoot = useInventoryStore((state) => state.items) // Get items at time of game over

  if (gameState !== 'GameOver') {
    return null // Don't render if game isn't over
  }

  const handlePlayAgain = () => {
    // Reset session store (sets gameState to NotStarted)
    resetSession()
    // No need to call setGameState here, resetSession handles it
  }

  // Helper to get item display color (duplicated from Graventory for now)
  // TODO: Extract to a shared utility
  const getItemColor = (item: Item): string => {
    if (item instanceof Equipment) {
      return item.rarityColor
    }
    return 'text-gray-300'
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-20">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full">
        <h2 className="text-4xl font-bold mb-4 text-red-500">
          {gameOverReason === 'Defeat' ? 'DEFEAT' : 'TIME UP'}
        </h2>

        <p className="text-xl mb-6 text-gray-300">
          You reached Wave <span className="font-bold text-yellow-400">{waveNumber}</span>.
        </p>

        <div className="mb-6 text-left max-h-40 overflow-y-auto border border-gray-600 rounded p-3 bg-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-200">Loot Collected This Session:</h3>
          {finalLoot.length > 0 ? (
            <ul className="text-sm space-y-1">
              {finalLoot.map((item) => (
                <li key={item.id} className={getItemColor(item)}>
                  {item.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic text-sm">No loot collected.</p>
          )}
        </div>

        <button
          onClick={handlePlayAgain}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xl shadow-lg transition duration-150 ease-in-out"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}

export { GameOverDisplay } 