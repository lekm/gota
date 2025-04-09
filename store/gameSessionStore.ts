import { create } from 'zustand'
import type { HeroStats } from '@/core/entities/Hero'

export type GameStatus = 'NotStarted' | 'InProgress' | 'GameOver'
export type GameOverReason = 'Defeat' | 'TimeUp' | null

interface GameSessionState {
  heroStats: HeroStats | null
  waveNumber: number
  timeRemaining: number
  isGameOver: boolean // Keep this for quick checks, though gameState is more descriptive
  gameState: GameStatus // Added game state
  gameOverReason: GameOverReason // Added reason
  // Actions
  updateHeroStats: (stats: HeroStats | null) => void
  setWaveNumber: (wave: number) => void
  setTimeRemaining: (time: number) => void
  setGameOver: (isOver: boolean) => void // Might deprecate later in favor of gameState
  setGameState: (status: GameStatus, reason?: GameOverReason) => void // Add optional reason param
  resetSession: () => void
}

const initialState = {
  heroStats: null,
  waveNumber: 0,
  timeRemaining: 0,
  isGameOver: false,
  gameState: 'NotStarted' as GameStatus, // Initial state
  gameOverReason: null // Initial reason is null
}

const useGameSessionStore = create<GameSessionState>((set) => ({
  ...initialState,
  updateHeroStats: (stats) => set({ heroStats: stats ? { ...stats } : null }), // Store a copy
  setWaveNumber: (wave) => set({ waveNumber: wave }),
  setTimeRemaining: (time) => set({ timeRemaining: Math.max(0, time) }),
  setGameOver: (isOver) => set({ isGameOver: isOver }),
  setGameState: (status, reason = null) => set({ // Default reason to null
    gameState: status,
    isGameOver: status === 'GameOver',
    // Set reason only if game is over, otherwise clear it
    gameOverReason: status === 'GameOver' ? reason : null 
  }),
  resetSession: () => set(initialState) // Resets reason to null
}))

export { useGameSessionStore } 