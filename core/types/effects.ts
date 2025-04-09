import type { GameStat } from './stats'

/**
 * Defines the structure for a temporary status effect, like from a Gravy.
 */
export interface GravyEffect {
  id: string; // Unique ID for this effect instance (if needed later)
  stat: GameStat; // The stat being modified
  value: number;  // The amount of modification
  type: 'flat' | 'percent'; // How the value is applied (additive or multiplicative)
  duration: number; // How long the effect lasts in seconds
  sourceGravyId: string; // Which Gravy applied this effect
} 