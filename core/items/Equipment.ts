import { Item } from './Item'
import type { Affix, AffixRarity } from './affixes' // Import Affix type and AffixRarity

type EquipmentSlot = 'Weapon' | 'Helm' | 'Body' | 'Accessory'

// Define structure for stats/affixes (kitchen-themed)
type StatModifier = {
  stat: 'zest' | 'chopSpeed' | 'heatDamage' | 'vigor' | 'defense' // Added 'defense'
  value: number
}

// Define rarity colors (example)
const RARITY_COLORS: Record<AffixRarity, string> = {
  common: 'text-gray-300', // Or default
  uncommon: 'text-green-400',
  rare: 'text-blue-400'
  // Add legendary, etc.
}

class Equipment extends Item {
  slot: EquipmentSlot
  modifiers: StatModifier[]
  prefix: Affix | null
  suffix: Affix | null
  rarity: AffixRarity
  rarityColor: string

  constructor (
    baseId: string,
    baseName: string, // Changed from 'name' to 'baseName'
    description: string,
    slot: EquipmentSlot,
    prefix: Affix | null = null,
    suffix: Affix | null = null
  ) {
    // Generate name based on affixes
    let generatedName = baseName
    if (prefix) {
      generatedName = `${prefix.namePart} ${generatedName}`
    }
    if (suffix) {
      generatedName = `${generatedName} ${suffix.namePart}`
    }

    super(baseId, generatedName, 'Equipment', description)
    this.slot = slot
    this.prefix = prefix
    this.suffix = suffix

    // Combine modifiers from prefix and suffix
    this.modifiers = []
    if (prefix) {
      this.modifiers.push(...prefix.generateModifiers())
    }
    if (suffix) {
      this.modifiers.push(...suffix.generateModifiers())
    }

    // Determine rarity based on highest affix rarity
    let highestRarity: AffixRarity = 'common'
    if (prefix?.rarity === 'rare' || suffix?.rarity === 'rare') {
      highestRarity = 'rare'
    } else if (prefix?.rarity === 'uncommon' || suffix?.rarity === 'uncommon') {
      highestRarity = 'uncommon'
    }
    this.rarity = highestRarity
    this.rarityColor = RARITY_COLORS[highestRarity] ?? RARITY_COLORS.common
  }

  // Helper to get total value for a specific stat from modifiers
  getStatValue (statName: StatModifier['stat']): number {
    return this.modifiers
      .filter(mod => mod.stat === statName)
      .reduce((sum, mod) => sum + mod.value, 0)
  }
}

export { Equipment }
export type { EquipmentSlot, StatModifier } 