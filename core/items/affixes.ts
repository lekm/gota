import type { StatModifier } from './Equipment'

// Define affix rarity levels
export type AffixRarity = 'common' | 'uncommon' | 'rare'

// Define the type for a single affix (prefix or suffix)
export interface Affix {
  id: string // Unique ID (e.g., 'zesty_prefix')
  type: 'prefix' | 'suffix'
  namePart: string // e.g., "Zesty", "of Slicing"
  rarity: AffixRarity // Added rarity
  levelRequirement?: number // For future scaling
  allowedSlots?: string[] // Restrict to specific slots (e.g., 'Weapon') - Optional
  generateModifiers: () => StatModifier[] // Function to generate random stat values within ranges
}

// --- Define Prefixes (with rarity) ---
const PREFIXES: Affix[] = [
  {
    id: 'sturdy_prefix',
    type: 'prefix',
    namePart: 'Sturdy',
    rarity: 'common', // Example rarity
    generateModifiers: () => [
      {
        stat: 'defense',
        value: Math.floor(Math.random() * 2) + 1 // 1-2 defense (Common)
      }
    ]
  },
  {
    id: 'zesty_prefix',
    type: 'prefix',
    namePart: 'Zesty',
    rarity: 'uncommon', // Example rarity
    generateModifiers: () => [
      {
        stat: 'zest',
        value: Math.floor(Math.random() * 3) + 2 // 2-4 zest (Uncommon)
      }
    ]
  },
  // Add more prefixes with different rarities...
]

// --- Define Suffixes (with rarity) ---
const SUFFIXES: Affix[] = [
  {
    id: 'of_vigor_suffix',
    type: 'suffix',
    namePart: 'of Vigor',
    rarity: 'common', // Example rarity
    generateModifiers: () => [
      {
        stat: 'vigor',
        value: Math.floor(Math.random() * 11) + 5 // 5-15 vigor (Common)
      }
    ]
  },
  {
    id: 'of_slicing_suffix',
    type: 'suffix',
    namePart: 'of Slicing',
    rarity: 'uncommon', // Example rarity
    allowedSlots: ['Weapon'],
    generateModifiers: () => [
      {
        stat: 'chopSpeed',
        value: parseFloat((Math.random() * 0.10 + 0.05).toFixed(2)) // 0.05-0.15 AS (Uncommon)
      }
    ]
  },
  // Add more suffixes with different rarities...
]

// --- Weighted Rarity Selection --- 
// Adjust these probabilities as needed
const RARITY_WEIGHTS: Record<AffixRarity, number> = {
  common: 0.65, // 65% chance
  uncommon: 0.28, // 28% chance
  rare: 0.07 // 7% chance
}

function selectAffixByRarity (affixes: Affix[]): Affix | null {
  if (affixes.length === 0) return null

  const roll = Math.random()
  let cumulative = 0

  for (const rarity of ['rare', 'uncommon', 'common'] as AffixRarity[]) {
    cumulative += RARITY_WEIGHTS[rarity]
    if (roll < cumulative) {
      // Filter affixes by the selected rarity
      const possibleAffixes = affixes.filter(a => a.rarity === rarity)
      if (possibleAffixes.length > 0) {
        // Pick a random affix from the filtered list
        return possibleAffixes[Math.floor(Math.random() * possibleAffixes.length)]
      } else {
        // Fallback: if no affix of selected rarity exists, try next lower rarity (or return null)
        // For simplicity now, we'll just let it potentially return null if a rarity is selected but no affix exists
        // A more robust system would guarantee an affix if *any* are available for the slot.
      }
    }
  }
  return null // Should theoretically not be reached if weights sum to 1 and common affixes exist
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
    !p.allowedSlots || !itemSlot || p.allowedSlots.includes(itemSlot)
  )
  const availableSuffixes = SUFFIXES.filter(s =>
    !s.allowedSlots || !itemSlot || s.allowedSlots.includes(itemSlot)
  )

  // Decide # of affixes (e.g., based on item quality roll - simple version now)
  // Let's say: 60% chance for 1 affix, 40% chance for 2 affixes
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