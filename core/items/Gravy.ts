import { Item } from './Item'
import type { GravyRecipe } from '../types/crafting'
import type { GravyEffect } from '../types/effects'
import type { GameStat } from '../types/stats' // Needed for effect stat
import { v4 as uuidv4 } from 'uuid'

class Gravy extends Item {
  recipe: GravyRecipe
  effectStat: GameStat // Which stat the Gravy primarily affects
  effectValue: number // The magnitude of the effect
  effectType: 'flat' | 'percent' // How the value applies
  effectDuration: number // Duration in seconds

  constructor (
    baseId: string,
    name: string,
    description: string,
    recipe: GravyRecipe,
    effectStat: GameStat,
    effectValue: number,
    effectType: 'flat' | 'percent',
    effectDuration: number
  ) {
    super(baseId, name, 'Gravy', description)
    this.recipe = recipe
    this.effectStat = effectStat
    this.effectValue = effectValue
    this.effectType = effectType
    this.effectDuration = effectDuration
  }

  // Method to generate the specific effect instance when used
  generateEffect (): GravyEffect {
    return {
      id: uuidv4(), // Unique ID for this specific application
      stat: this.effectStat,
      value: this.effectValue,
      type: this.effectType,
      duration: this.effectDuration,
      sourceGravyId: this.baseId // Link back to the Gravy type
    }
  }
}

export { Gravy } 