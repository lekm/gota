import { Item } from '../items/Item'
import { Equipment, type StatModifier, type EquipmentSlot } from '../items/Equipment'
import { Ingredient } from '../items/Ingredient'
import { getRandomAffixes } from '../items/affixes' // Import affix generation

// Represents an item that can drop and its probability
interface LootDrop {
  itemBaseId: string // Reference to the base item type
  chance: number // Probability (0 to 1)
  minQuantity?: number
  maxQuantity?: number
}

// Base item definitions (could be loaded from a JSON/data file)
const BASE_ITEMS: Record<string, { name: string, description: string, type: 'Equipment' | 'Ingredient', slot?: EquipmentSlot }> = {
  spatula_base: { name: 'Spatula', description: 'A basic flipper.', type: 'Equipment', slot: 'Weapon' },
  colander_helm_base: { name: 'Colander Helm', description: 'Surprisingly protective.', type: 'Equipment', slot: 'Helm' },
  mystic_roux: { name: 'Mystic Roux', description: 'Thickens more than just sauces.', type: 'Ingredient' },
  salt_shard: { name: 'Salt Shard', description: 'Concentrated flavor.', type: 'Ingredient' }
  // Add more base items
}

// Simple loot table class
class LootTable {
  private drops: LootDrop[]

  constructor (drops: LootDrop[]) {
    // Basic validation: Ensure chances don't exceed 1 (though overlaps are possible)
    this.drops = drops.filter(d => d.chance > 0)
  }

  // Attempts to roll for drops based on the table
  roll (): Item[] {
    const droppedItems: Item[] = []
    const roll = Math.random() // Single roll for simplicity (0 <= roll < 1)
    let cumulativeChance = 0

    // Simple roll logic: check each item sequentially
    // More complex systems might use weighted rolls or roll multiple times
    for (const drop of this.drops) {
      cumulativeChance += drop.chance
      if (roll < cumulativeChance) {
        // Item dropped! Determine quantity (default 1)
        const quantity = Math.floor(Math.random() *
          ((drop.maxQuantity ?? 1) - (drop.minQuantity ?? 1) + 1)) +
          (drop.minQuantity ?? 1)

        for (let i = 0; i < quantity; i++) {
          const newItem = this.createItemInstance(drop.itemBaseId)
          if (newItem) {
            droppedItems.push(newItem)
          }
        }
        // For this simple sequential roll, stop after the first successful drop
        // Modify if multiple different drops per roll are desired
        break
      }
    }

    return droppedItems
  }

  // Factory function to create item instances based on baseId
  private createItemInstance (baseId: string): Item | null {
    const baseItemData = BASE_ITEMS[baseId]
    if (!baseItemData) {
      console.warn(`Unknown item baseId in BASE_ITEMS: ${baseId}`)
      return null
    }

    switch (baseItemData.type) {
      case 'Equipment': {
        if (!baseItemData.slot) {
          console.warn(`Equipment base item missing slot: ${baseId}`)
          return null
        }
        // Get random affixes for this equipment type
        const { prefix, suffix } = getRandomAffixes(baseItemData.slot)
        // Create Equipment instance with potential affixes
        return new Equipment(
          baseId,
          baseItemData.name,
          baseItemData.description,
          baseItemData.slot,
          prefix,
          suffix
        )
      }
      case 'Ingredient':
        return new Ingredient(
          baseId,
          baseItemData.name,
          baseItemData.description
        )
      default:
        console.warn(`Unhandled item type in createItemInstance: ${baseItemData.type}`)
        return null
    }
  }
}

export { LootTable }
export type { LootDrop }