import { LootTable, type LootDrop } from '../loot/LootTable'
import type { Item } from '../items/Item'
import { 
  MONSTER_BASE_HEALTH, 
  MONSTER_HEALTH_K, 
  MONSTER_BASE_DAMAGE, 
  MONSTER_DAMAGE_K, 
  MONSTER_STAT_POWER, 
  MONSTER_ATTACK_SPEED,
  XP_GAIN_BASE,
  XP_GAIN_HEALTH_FACTOR
} from '../config' // Import monster/XP config

interface MonsterStats {
  health: number
  maxHealth: number
  damage: number
  attackSpeed: number
}

class Monster {
  x: number
  y: number
  stats: MonsterStats
  name: string
  lootTable: LootTable
  wave: number // Store the wave this monster belongs to
  // TODO: Add monster type, etc.

  constructor (x: number, y: number, name: string, wave: number) {
    this.x = x
    this.y = y
    this.name = name
    this.wave = wave

    // Calculate stats based on wave
    const waveFactor = Math.max(0, wave - 1) // Wave 1 has factor 0
    const scaledHealth = Math.floor(MONSTER_BASE_HEALTH + MONSTER_HEALTH_K * Math.pow(waveFactor, MONSTER_STAT_POWER))
    const scaledDamage = Math.floor(MONSTER_BASE_DAMAGE + MONSTER_DAMAGE_K * Math.pow(waveFactor, MONSTER_STAT_POWER))
    
    this.stats = {
      health: scaledHealth,
      maxHealth: scaledHealth,
      damage: scaledDamage,
      attackSpeed: MONSTER_ATTACK_SPEED // Keep constant for now
    }

    // --- Define Loot Table (Could also be scaled by wave later) --- 
    const drops: LootDrop[] = [
      { itemBaseId: 'mystic_roux', chance: 0.25 },
      { itemBaseId: 'salt_shard', chance: 0.40 },
      { itemBaseId: 'spatula_base', chance: 0.10 },
    ]
    this.lootTable = new LootTable(drops)
    // --- End Loot Table Definition ---
  }

  takeDamage (damage: number) {
    const actualDamage = Math.max(0, damage)
    this.stats.health = Math.max(0, this.stats.health - actualDamage)
  }

  isAlive (): boolean {
    return this.stats.health > 0
  }

  // Method to generate loot AND XP when the monster dies
  getDeathRewards (): { loot: Item[], xp: number } {
    console.log(`${this.name} (Wave ${this.wave}) dropping rewards...`)
    const loot = this.lootTable.roll()
    // Calculate XP based on max health
    const xp = Math.floor(XP_GAIN_BASE + this.stats.maxHealth * XP_GAIN_HEALTH_FACTOR)
    return { loot, xp }
  }

  // TODO: Add methods for attack, etc.
}

export { Monster }
export type { MonsterStats } 