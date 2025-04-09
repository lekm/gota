// core/items/gravyDefinitions.ts
import type { GravyRecipe } from '../types/crafting'
import type { GameStat } from '../types/stats'
import { Gravy } from './Gravy'

// Interface for the base definition data
interface BaseGravyData {
  name: string;
  description: string;
  recipe: GravyRecipe;
  effectStat: GameStat;
  effectValue: number;
  effectType: 'flat' | 'percent';
  effectDuration: number; // in seconds
}

// Define base Gravies
export const BASE_GRAVIES: Record<string, BaseGravyData> = {
  gravy_of_zest: {
    name: 'Gravy of Zest',
    description: 'Temporarily increases Damage.',
    recipe: { mystic_roux: 1, salt_shard: 2 }, // Example recipe
    effectStat: 'damage',
    effectValue: 5, // Example: +5 flat damage
    effectType: 'flat',
    effectDuration: 30 // 30 seconds
  },
  gravy_of_speed: {
    name: 'Gravy of Speed',
    description: 'Temporarily increases Attack Speed.',
    recipe: { mystic_roux: 2 }, // Example recipe
    effectStat: 'attackSpeed',
    effectValue: 0.2, // Example: +0.2 attacks/sec
    effectType: 'flat',
    effectDuration: 20 // 20 seconds
  }
  // Add more gravies here
};

// Function to create a Gravy instance from its base ID
export function createGravyInstance (baseId: string): Gravy | null {
  const data = BASE_GRAVIES[baseId];
  if (!data) {
    console.warn(`Unknown Gravy baseId: ${baseId}`);
    return null;
  }
  return new Gravy(
    baseId,
    data.name,
    data.description,
    data.recipe,
    data.effectStat,
    data.effectValue,
    data.effectType,
    data.effectDuration
  );
} 