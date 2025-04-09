import type { StatModifier, EquipmentSlot } from './Equipment'
import type { GameStat } from '../types/stats'

// Define affix rarity levels
export type AffixRarity = 'common' | 'uncommon' | 'rare'

// Define the type for a single affix (prefix or suffix)
export interface Affix {
  id: string
  type: 'prefix' | 'suffix'
  namePart: string
  rarity: AffixRarity
  allowedSlots?: EquipmentSlot[] // Corrected type name
  generateModifiers: () => StatModifier[]
}

// --- Define Prefixes (using Core Stats) ---
const PREFIXES: Affix[] = [
  {
    id: 'sturdy_prefix',
    type: 'prefix',
    namePart: 'Sturdy',
    rarity: 'common',
    generateModifiers: (): StatModifier[] => [
      { stat: 'defense', value: Math.floor(Math.random() * 3) + 1 } // 1-3 defense
    ]
  },
  {
    id: 'strong_prefix',
    type: 'prefix',
    namePart: 'Strong',
    rarity: 'uncommon',
    generateModifiers: (): StatModifier[] => [
      { stat: 'strength', value: Math.floor(Math.random() * 3) + 1 } // 1-3 STR
    ]
  },
  {
    id: 'agile_prefix',
    type: 'prefix',
    namePart: 'Agile',
    rarity: 'uncommon',
    generateModifiers: (): StatModifier[] => [
      { stat: 'dexterity', value: Math.floor(Math.random() * 3) + 1 } // 1-3 DEX
    ]
  },
  {
    id: 'vital_prefix',
    type: 'prefix',
    namePart: 'Vital',
    rarity: 'rare',
    generateModifiers: (): StatModifier[] => [
      { stat: 'constitution', value: Math.floor(Math.random() * 2) + 2 } // 2-3 CON (Rare)
    ]
  }
  // Add more prefixes (e.g., Intelligent, Critical)
]

// --- Define Suffixes (using Core Stats) ---
const SUFFIXES: Affix[] = [
  {
    id: 'of_health_suffix',
    type: 'suffix',
    namePart: 'of Health',
    rarity: 'common',
    generateModifiers: (): StatModifier[] => [
      // Example: Flat Max Health Bonus (Needs handling in getEffectiveStats)
      // { stat: 'maxHealth', value: Math.floor(Math.random() * 11) + 10 } // 10-20 MaxHP
      // OR bonus to CON (preferred if using primary attributes)
       { stat: 'constitution', value: Math.floor(Math.random() * 2) + 1 } // 1-2 CON
    ]
  },
  {
    id: 'of_criticals_suffix',
    type: 'suffix',
    namePart: 'of Criticals',
    rarity: 'uncommon',
    allowedSlots: ['Gloves', 'Main Hand', 'Hat'], // Example slots
    generateModifiers: (): StatModifier[] => [
      { stat: 'critChance', value: parseFloat((Math.random() * 0.03 + 0.01).toFixed(2)) } // 1-4% Crit Chance
    ]
  },
  {
    id: 'of_power_suffix',
    type: 'suffix',
    namePart: 'of Power',
    rarity: 'rare',
    allowedSlots: ['Main Hand', 'Gloves', 'Neck Tatts'],
    generateModifiers: (): StatModifier[] => [
      { stat: 'critDamage', value: parseFloat((Math.random() * 0.15 + 0.05).toFixed(2)) } // 5-20% Crit Damage
    ]
  }
  // Add more suffixes (e.g., of Attack Speed, of Defense)
]

// --- Weighted Rarity Selection --- 
// Adjust these probabilities as needed
const RARITY_WEIGHTS: Record<AffixRarity, number> = {
  common: 0.65, // 65% chance
  uncommon: 0.28, // 28% chance
  rare: 0.07 // 7% chance
}

function selectAffixByRarity (affixList: Affix[]): Affix | null {
  if (affixList.length === 0) return null

  const rand = Math.random()
  let cumulativeWeight = 0

  for (const rarity of ['common', 'uncommon', 'rare'] as AffixRarity[]) {
    const weight = RARITY_WEIGHTS[rarity]
    cumulativeWeight += weight
    if (rand <= cumulativeWeight) {
      // Filter affixes of this rarity and pick one randomly
      const candidates = affixList.filter(a => a.rarity === rarity)
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)]
      }
      // Fallback if no affixes of this rarity exist (should ideally not happen with good data)
      break
    }
  }
  // Fallback to random affix if something went wrong
  return affixList[Math.floor(Math.random() * affixList.length)]
}

// --- Refined getRandomAffixes function --- 
export function getRandomAffixes (itemSlot?: string): {
  prefix: Affix | null
  suffix: Affix | null
} {
  let prefix: Affix | null = null
  let suffix: Affix | null = null

  // Determine available affixes for the slot
  const availablePrefixes = PREFIXES.filter(p =>
    !p.allowedSlots || !itemSlot || (p.allowedSlots as string[]).includes(itemSlot)
  )
  const availableSuffixes = SUFFIXES.filter(s =>
    !s.allowedSlots || !itemSlot || (s.allowedSlots as string[]).includes(itemSlot)
  )

  // Decide # of affixes (e.g., based on item quality roll - simple version now)
  const numAffixes = Math.random() < 0.6 ? 1 : 2
  const affixPool: (Affix | null)[] = []

  // Try to get a prefix based on rarity
  const rolledPrefix = selectAffixByRarity(availablePrefixes)
  if (rolledPrefix) affixPool.push(rolledPrefix)
  
  // Try to get a suffix based on rarity
  const rolledSuffix = selectAffixByRarity(availableSuffixes)
  if (rolledSuffix) affixPool.push(rolledSuffix)

  // Shuffle the pool to randomize which affix(es) get picked if pool > numAffixes
  for (let i = affixPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [affixPool[i], affixPool[j]] = [affixPool[j], affixPool[i]];
  }

  // Assign based on numAffixes desired
  let assignedCount = 0
  for(const affix of affixPool) {
    if (assignedCount >= numAffixes) break
    if (!affix) continue

    if (affix.type === 'prefix' && !prefix) {
      prefix = affix
      assignedCount++
    } else if (affix.type === 'suffix' && !suffix) {
      suffix = affix
      assignedCount++
    }
  }

  return { prefix, suffix }
} 