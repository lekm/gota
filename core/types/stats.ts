/**
 * Defines all possible core stats used for Heroes, Items, and Monsters.
 */
export type GameStat = 
  // Primary Attributes
  | 'strength'
  | 'dexterity'
  | 'intelligence'
  | 'constitution'

  // Derived Combat Stats
  | 'health'                // Current HP
  | 'maxHealth'             // Max HP (influenced by CON)
  | 'damage'                // Base Physical Damage (influenced by STR)
  | 'attackSpeed'           // Attacks per second (influenced by DEX)
  | 'defense'               // Physical Damage Reduction
  | 'critChance'            // % Chance for critical hit (influenced by DEX)
  | 'critDamage'            // % Damage multiplier on critical hit
  // Add mana/energy/focus later if needed

  // Kitchen-Themed Stats (Examples)
  | 'zest'            // Could modify damage, crit chance, etc. (Currently mapped to Damage)
  | 'vigor'           // Could modify health regen, max health, etc. (Currently mapped to Max Health)
  | 'chopSpeed'       // Could modify attack speed, skill speed, etc. (Currently mapped to Attack Speed)
  | 'heatDamage'      // Additional fire/heat elemental damage
  // Add other potential stats here (e.g., dodge, elementalResistances)

// Optional: Define display names map if needed globally
// export const STAT_DISPLAY_NAMES: Record<GameStat, string> = {
//   health: 'Health',
//   maxHealth: 'Max Health',
//   damage: 'Damage',
//   attackSpeed: 'Attack Speed',
//   defense: 'Defense',
//   zest: 'Zest',
//   vigor: 'Vigor',
//   chopSpeed: 'Chopping Speed',
//   heatDamage: 'Heat Damage'
// }; 