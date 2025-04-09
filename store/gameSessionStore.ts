import { create } from 'zustand'
import type { HeroStats } from '@/core/entities/Hero'

export type GameStatus = 'NotStarted' | 'InProgress' | 'GameOver'
export type GameOverReason = 'Defeat' | 'TimeUp' | null

// Type for XP info
interface HeroXPInfo {
  currentXP: number
  xpToNextLevel: number
}

interface GameSessionState {
  heroStats: HeroStats | null
  waveNumber: number
  timeRemaining: number
  isGameOver: boolean // Keep this for quick checks, though gameState is more descriptive
  gameState: GameStatus // Added game state
  gameOverReason: GameOverReason // Added reason
  heroLevel: number // Added hero level
  heroXPInfo: HeroXPInfo | null // Added XP details
  // Actions
  updateHeroStats: (stats: HeroStats | null) => void
  setWaveNumber: (wave: number) => void
  setTimeRemaining: (time: number) => void
  setGameOver: (isOver: boolean) => void // Might deprecate later in favor of gameState
  setGameState: (status: GameStatus, reason?: GameOverReason) => void // Add optional reason param
  setHeroLevelAndXP: (level: number, xpInfo: HeroXPInfo | null) => void // New action
  resetSession: () => void
}

const initialState = {
  heroStats: null,
  waveNumber: 0,
  timeRemaining: 0,
  isGameOver: false,
  gameState: 'NotStarted' as GameStatus, // Initial state
  gameOverReason: null, // Initial reason is null
  heroLevel: 0, // Initial level 0 or 1?
  heroXPInfo: null // Initial XP null
}

const useGameSessionStore = create<GameSessionState>((set) => ({
  ...initialState,
  updateHeroStats: (stats) => set({ heroStats: stats ? { ...stats } : null }), // Store a copy
  setWaveNumber: (wave) => set({ waveNumber: wave }),
  setTimeRemaining: (time) => set({ timeRemaining: Math.max(0, time) }),
  setGameOver: (isOver) => set({ isGameOver: isOver }),
  setGameState: (status, reason = null) => set({ 
    gameState: status,
    isGameOver: status === 'GameOver',
    gameOverReason: status === 'GameOver' ? reason : null 
  }),
  setHeroLevelAndXP: (level, xpInfo) => set({ 
    heroLevel: level,
    // Store a copy of xpInfo if it exists
    heroXPInfo: xpInfo ? { ...xpInfo } : null 
  }),
  resetSession: () => set(initialState) // Resets level and XP too
}))

export { useGameSessionStore }
export type { HeroXPInfo } // Export new type 