import { create } from 'zustand'
import type { HeroStats, DetailedHeroStats } from '@/core/entities/Hero'
import type { GravyEffect } from '@/core/types/effects'

export type GameStatus = 'NotStarted' | 'InProgress' | 'GameOver'
// Define reasons for game over
export type GameOverReason = 'HeroDefeated' | 'TimeExpired' | null;

// Type for XP info
interface HeroXPInfo {
  currentXP: number
  xpToNextLevel: number
}

interface GameSessionState {
  heroStats: DetailedHeroStats | null // Store the detailed stats object
  waveNumber: number
  timeRemaining: number
  isGameOver: boolean // Keep this for quick checks, though gameState is more descriptive
  gameState: GameStatus // Added game state
  gameOverReason: GameOverReason // Added reason
  heroLevel: number // Added hero level
  heroXPInfo: HeroXPInfo | null // Added XP details
  activeEffects: GravyEffect[] // New state for active buffs
  // Actions
  updateHeroStats: (stats: DetailedHeroStats | null) => void // Action takes the detailed object
  setWaveNumber: (wave: number) => void
  setTimeRemaining: (time: number) => void
  setGameOver: (isOver: boolean) => void // Might deprecate later in favor of gameState
  setGameState: (status: GameStatus, reason?: GameOverReason) => void // Add optional reason param
  setHeroLevelAndXP: (level: number, xpInfo: HeroXPInfo | null) => void // New action
  addActiveEffect: (effect: GravyEffect) => void // New action
  updateActiveEffects: (deltaTime: number) => void // New action
  resetSession: () => void
}

const initialState = {
  heroStats: null, // Initial state is null
  waveNumber: 0,
  timeRemaining: 0,
  isGameOver: false,
  gameState: 'NotStarted' as GameStatus, // Initial state
  gameOverReason: null, // Initial reason is null
  heroLevel: 0, // Initial level 0 or 1?
  heroXPInfo: null, // Initial XP null
  activeEffects: [] // Initialize as empty array
}

const useGameSessionStore = create<GameSessionState>((set, get) => ({
  ...initialState,
  // Ensure we store a deep copy if needed, or just the object reference
  updateHeroStats: (stats) => set({ heroStats: stats ? { ...stats } : null }),
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
    heroXPInfo: xpInfo ? { ...xpInfo } : null 
  }),
  addActiveEffect: (effect) => set((state) => ({
    // Prevent stacking identical effects from the same source? Optional.
    // For now, just add it.
    activeEffects: [...state.activeEffects, effect]
  })),
  updateActiveEffects: (deltaTime) => set((state) => ({
    activeEffects: state.activeEffects
      .map(effect => ({ ...effect, duration: effect.duration - deltaTime }))
      .filter(effect => effect.duration > 0)
  })),
  resetSession: () => set(initialState) // Resets level and XP too
}))

export { useGameSessionStore }
export type { HeroXPInfo } // Export new type 