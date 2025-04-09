// core/config.ts
import type { GameStat } from './types/stats' // Import GameStat

// --- Leveling System --- 
export const BASE_XP_REQ = 100
export const XP_REQ_POWER = 1.5

export function calculateXPForLevel (level: number): number {
  if (level <= 0) return 0
  return Math.floor(BASE_XP_REQ * Math.pow(level, XP_REQ_POWER))
}

// Define gains for PRIMARY attributes per level
export const STAT_GAINS_PER_LEVEL: Partial<Record<GameStat, number>> = {
  strength: 1,
  dexterity: 1,
  intelligence: 0, // Or 1 if skills are planned soon
  constitution: 2,
  defense: 1 // Can also grant base derived stats directly
  // Other derived stats (damage, maxHealth, AS, crit) are calculated from these
}

// --- Monster Scaling --- 
export const MONSTER_BASE_HEALTH = 20
export const MONSTER_HEALTH_K = 0.5
export const MONSTER_BASE_DAMAGE = 5
export const MONSTER_DAMAGE_K = 0.1
export const MONSTER_STAT_POWER = 1.8 // Power for wave scaling
export const MONSTER_ATTACK_SPEED = 0.8 // Constant for now

// --- XP Gain --- 
export const XP_GAIN_BASE = 1
export const XP_GAIN_HEALTH_FACTOR = 0.15 