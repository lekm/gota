import type { Equipment, StatModifier, EquipmentSlot } from '../items/Equipment'
import type { EquippedItems } from '@/store/inventoryStore' // Import EquippedItems type

interface HeroStats {
  health: number
  maxHealth: number
  damage: number
  attackSpeed: number // Attacks per second
  defense: number
  // TODO: Add kitchen-themed stats like zest, vigor
}

class Hero {
  x: number
  y: number
  baseStats: HeroStats // Store the hero's base stats separately
  // Equipped items are passed in for calculations, not stored directly on Hero instance

  constructor (x: number, y: number, initialEquipment?: EquippedItems) {
    this.x = x
    this.y = y
    // Base stats for Chef Antoine
    this.baseStats = {
      health: 100,
      maxHealth: 100,
      damage: 10,
      attackSpeed: 1.0,
      defense: 5
    }
    // Apply initial equipment effects to starting health if needed?
    // For now, we assume starting health is always base max health.
    // Effective stats will handle current health based on damage taken.
  }

  // Calculate effective stats by applying equipment modifiers
  getEffectiveStats (equippedItems?: EquippedItems): HeroStats {
    const effective = { ...this.baseStats }

    if (equippedItems) {
      // Iterate through equipped items and apply modifiers
      Object.values(equippedItems).forEach(item => {
        if (!item) return // Skip empty slots
        item.modifiers.forEach(mod => {
          switch (mod.stat) {
            case 'vigor': // Example: Vigor increases Max Health
              effective.maxHealth += mod.value
              effective.health += mod.value // Also increase current health? Or manage separately?
              break
            case 'zest': // Example: Zest increases Damage
              effective.damage += mod.value
              break
            case 'chopSpeed': // Example: Chop Speed increases Attack Speed
              effective.attackSpeed += mod.value // Assuming flat increase for now
              break
            // TODO: Add cases for other stats (defense, heatDamage etc.)
          }
        })
      })
    }
    // Ensure health doesn't exceed new maxHealth
    effective.health = Math.min(effective.health, effective.maxHealth);

    // Prevent stats from going below a certain threshold if needed (e.g., attack speed > 0)
    effective.attackSpeed = Math.max(0.1, effective.attackSpeed); // Ensure minimum attack speed

    return effective
  }

  takeDamage (damage: number, equippedItems?: EquippedItems) {
    const effectiveStats = this.getEffectiveStats(equippedItems) // Get defense based on current gear
    // Simple defense calculation
    const actualDamage = Math.max(0, damage - effectiveStats.defense)
    
    // Apply damage to BASE health. Effective stats will reflect current + max.
    this.baseStats.health = Math.max(0, this.baseStats.health - actualDamage)
    // Note: Now rely on getEffectiveStats to return the correct current health
  }

  isAlive (): boolean {
    // Check base health, as effective health might be temporarily boosted
    return this.baseStats.health > 0
  }

  // TODO: Add methods for levelUp (modifies baseStats), etc.
}

export { Hero }
export type { HeroStats } 