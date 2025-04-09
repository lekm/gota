import { LootTable, type LootDrop } from '../loot/LootTable'
import type { Item } from '../items/Item'

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
  // TODO: Add monster type, etc.

  constructor (x: number, y: number, name: string, baseStats: Partial<MonsterStats> = {}) {
    this.x = x
    this.y = y
    this.name = name
    // Base stats + any overrides/wave scaling
    this.stats = {
      health: 20,
      maxHealth: 20,
      damage: 5,
      attackSpeed: 0.8,
      ...baseStats // Apply adjustments
    }

    // --- Define Loot Table --- 
    // Example for Angry Asparagus
    const drops: LootDrop[] = [
      { itemBaseId: 'mystic_roux', chance: 0.25 }, // 25% chance
      { itemBaseId: 'salt_shard', chance: 0.40 }, // 40% chance (cumulative 65%)
      { itemBaseId: 'spatula_base', chance: 0.10 }, // 10% chance (cumulative 75%)
      // Leaves 25% chance of no drop from this specific table
    ]
    // TODO: Define different loot tables based on monster name/type
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

  generateLoot (): Item[] {
    return this.lootTable.roll()
  }

  // TODO: Add methods for attack, etc.
}

export { Monster }
export type { MonsterStats } 