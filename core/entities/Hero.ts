import type { Equipment, StatModifier, EquipmentSlot } from '../items/Equipment'
import type { EquippedItems } from '@/store/inventoryStore' // Import EquippedItems type
import { calculateXPForLevel, STAT_GAINS_PER_LEVEL } from '../config' // Import leveling config

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
  level: number
  currentXP: number
  xpToNextLevel: number
  // Equipped items are passed in for calculations, not stored directly on Hero instance

  constructor (x: number, y: number, initialEquipment?: EquippedItems) {
    this.x = x
    this.y = y
    this.level = 1
    this.currentXP = 0
    this.xpToNextLevel = calculateXPForLevel(this.level)

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
              break
            case 'zest': // Example: Zest increases Damage
              effective.damage += mod.value
              break
            case 'chopSpeed': // Example: Chop Speed increases Attack Speed
              effective.attackSpeed += mod.value // Assuming flat increase for now
              break
            case 'defense': // Handle defense from gear
              effective.defense += mod.value
              break
            // TODO: Add cases for other stats (heatDamage etc.)
          }
        })
      })
    }
    // Apply level-based increases directly to baseStats on level up
    // We only need to ensure current health doesn't exceed max
    effective.health = Math.min(this.baseStats.health, effective.maxHealth);
    effective.attackSpeed = Math.max(0.1, effective.attackSpeed);
    return effective
  }

  gainXP (amount: number): boolean {
    let leveledUp = false
    this.currentXP += amount
    console.log(`Hero gained ${amount} XP (Total: ${this.currentXP}/${this.xpToNextLevel})`);

    while (this.currentXP >= this.xpToNextLevel) {
      leveledUp = true
      this.level++
      this.currentXP -= this.xpToNextLevel
      this.xpToNextLevel = calculateXPForLevel(this.level)
      console.log(`%cLEVEL UP! Reached Level ${this.level}!`, 'color: yellow; font-weight: bold;');

      // Apply base stat gains
      this.baseStats.maxHealth += STAT_GAINS_PER_LEVEL.maxHealth
      // Increase current health proportionally or fully heal? Let's add the gain.
      this.baseStats.health += STAT_GAINS_PER_LEVEL.maxHealth 
      this.baseStats.damage += STAT_GAINS_PER_LEVEL.damage
      this.baseStats.defense += STAT_GAINS_PER_LEVEL.defense
      this.baseStats.attackSpeed += STAT_GAINS_PER_LEVEL.attackSpeed

      // Ensure health doesn't exceed new max after gain
      this.baseStats.health = Math.min(this.baseStats.health, this.baseStats.maxHealth);

      // TODO: Trigger level up effect/notification in UI via store?
    }
    return leveledUp
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