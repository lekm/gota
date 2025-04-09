import { Item } from './Item'
import type { Affix, AffixRarity } from './affixes' // Import Affix type and AffixRarity
import type { GameStat } from '../types/stats' // Import the unified stat type

type EquipmentSlot = 
  | 'Hat'        // Renamed from Helm
  | 'Jacket'     // Renamed from Body
  | 'Pants'      // Renamed from Legs
  | 'Shoes'      // Renamed from Feet
  | 'Gloves'     // Renamed from Hands
  | 'Apron'      // Renamed from Back
  | 'Arm Tatts'  // Renamed from Tattoos
  | 'Neck Tatts' // Renamed from Neck
  | 'Main Hand'  // Renamed from Weapon
  | 'Off Hand'   // New
  | 'Tobacco'    // Renamed from Trinket 1
  | 'Drugs'      // Renamed from Trinket 2

// Update StatModifier to use GameStat
type StatModifier = {
  stat: GameStat
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
  getStatValue (statName: GameStat): number {
    return this.modifiers
      .filter(mod => mod.stat === statName)
      .reduce((sum, mod) => sum + mod.value, 0)
  }
}

export { Equipment }
export type { EquipmentSlot, StatModifier } 