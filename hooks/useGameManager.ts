// hooks/useGameManager.ts
import { createContext, useContext } from 'react';
import type { GameManager } from '@/core/GameManager'; // Assuming GameManager is exported

// Create a context to hold the GameManager instance
const GameManagerContext = createContext<GameManager | null>(null);

// Custom hook to access the GameManager instance
export function useGameManager() {
  const context = useContext(GameManagerContext);
  // No strict check here, allow null return if used outside provider
  // Components using it should handle the null case (e.g., disable buttons)
  return context; 
}

// Export the Provider component
export const GameManagerProvider = GameManagerContext.Provider; 