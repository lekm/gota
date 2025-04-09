import type { Equipment, StatModifier, EquipmentSlot } from '../items/Equipment'
import type { EquippedItems } from '@/store/inventoryStore' // Import EquippedItems type
import { calculateXPForLevel, STAT_GAINS_PER_LEVEL } from '../config' // Import leveling config
import type { GameStat } from '../types/stats' // Import the unified stat type

// Structure for detailed stat breakdown
interface StatBreakdown {
  base: number;         // Base value (from initial stats or calculated from base attributes)
  gear: number;         // Total bonus from equipped items
  // attribute?: number; // Optional: Contribution from primary attributes (can be complex to show cleanly)
  final: number;        // The final effective value
}

// New interface for the detailed stats object
interface DetailedHeroStats {
  strength: StatBreakdown;
  dexterity: StatBreakdown;
  intelligence: StatBreakdown;
  constitution: StatBreakdown;
  health: StatBreakdown; // Current health doesn't really have a breakdown, just use final
  maxHealth: StatBreakdown;
  damage: StatBreakdown;
  attackSpeed: StatBreakdown;
  defense: StatBreakdown;
  critChance: StatBreakdown;
  critDamage: StatBreakdown;
}

// Explicitly define HeroStats with the core stats
interface HeroStats {
  // Primary Attributes
  strength: number
  dexterity: number
  intelligence: number
  constitution: number

  // Derived Combat Stats
  health: number
  maxHealth: number
  damage: number
  attackSpeed: number
  defense: number
  critChance: number
  critDamage: number
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

    // Base stats for Chef Antoine using new GameStat keys
    this.baseStats = {
      // Primary Attributes
      strength: 10,
      dexterity: 10,
      intelligence: 8, 
      constitution: 12,

      // Derived Stats (Initial values - some will be calculated)
      health: 0, // Will be set based on maxHealth
      maxHealth: 0, // Will be calculated from CON
      damage: 0, // Will be calculated from STR
      attackSpeed: 0, // Will be calculated from DEX
      defense: 5, // Base defense value
      critChance: 0.05, // Base 5% crit chance
      critDamage: 1.5 // Base 150% crit damage multiplier
    }
    // Calculate initial derived stats based on base attributes
    this.calculateInitialDerivedStats()
    // Set current health to max initially
    this.baseStats.health = this.baseStats.maxHealth
  }

  // Helper to calculate initial derived stats from base attributes
  private calculateInitialDerivedStats() {
    // Example formulas (adjust multipliers as needed)
    this.baseStats.maxHealth = 50 + (this.baseStats.constitution * 5) // e.g., 5 HP per CON point + base
    this.baseStats.damage = 5 + (this.baseStats.strength * 1)      // e.g., 1 Damage per STR point + base
    this.baseStats.attackSpeed = 0.8 + (this.baseStats.dexterity * 0.02) // e.g., 0.02 AS per DEX point + base
    // CritChance and CritDamage base values are set directly for now
    // Defense base value is set directly
  }

  // Return the new DetailedHeroStats type
  getEffectiveStats (equippedItems?: EquippedItems): DetailedHeroStats {
    const detailed: DetailedHeroStats = {
      strength: { base: this.baseStats.strength, gear: 0, final: 0 },
      dexterity: { base: this.baseStats.dexterity, gear: 0, final: 0 },
      intelligence: { base: this.baseStats.intelligence, gear: 0, final: 0 },
      constitution: { base: this.baseStats.constitution, gear: 0, final: 0 },
      health: { base: this.baseStats.health, gear: 0, final: this.baseStats.health },
      maxHealth: { base: 50 + (this.baseStats.constitution * 5), gear: 0, final: 0 }, 
      damage: { base: 5 + (this.baseStats.strength * 1), gear: 0, final: 0 },
      attackSpeed: { base: 0.8 + (this.baseStats.dexterity * 0.02), gear: 0, final: 0 },
      defense: { base: this.baseStats.defense, gear: 0, final: 0 },
      critChance: { base: this.baseStats.critChance, gear: 0, final: 0 },
      critDamage: { base: this.baseStats.critDamage, gear: 0, final: 0 },
    };

    // 1. Accumulate Gear Bonuses
    if (equippedItems) {
      Object.values(equippedItems).forEach(item => {
        if (!item) return;
        item.modifiers.forEach(mod => {
          const statName = mod.stat as GameStat;
          if (statName in detailed) {
            const key = statName as keyof DetailedHeroStats;
            if (['strength', 'dexterity', 'intelligence', 'constitution', 'defense', 'critChance', 'critDamage'].includes(key)) {
              detailed[key].gear += mod.value;
            }
            // else if (key === 'maxHealth') { detailed.maxHealth.gear += mod.value; }
          }
        });
      });
    }

    // 2. Calculate Final Primary Attributes
    detailed.strength.final = detailed.strength.base + detailed.strength.gear;
    detailed.dexterity.final = detailed.dexterity.base + detailed.dexterity.gear;
    detailed.intelligence.final = detailed.intelligence.base + detailed.intelligence.gear;
    detailed.constitution.final = detailed.constitution.base + detailed.constitution.gear;

    // 3. Calculate Final Derived Stats based on FINAL Primary Attributes and Gear bonuses
    detailed.maxHealth.base = 50 + (detailed.constitution.base * 5); 
    detailed.maxHealth.final = 50 + (detailed.constitution.final * 5) + detailed.maxHealth.gear;

    detailed.damage.base = 5 + (detailed.strength.base * 1); 
    detailed.damage.final = 5 + (detailed.strength.final * 1) + detailed.damage.gear;

    detailed.attackSpeed.base = 0.8 + (detailed.dexterity.base * 0.02); 
    detailed.attackSpeed.final = 0.8 + (detailed.dexterity.final * 0.02) + detailed.attackSpeed.gear;

    detailed.defense.final = detailed.defense.base + detailed.defense.gear;

    detailed.critChance.final = detailed.critChance.base + detailed.critChance.gear;

    detailed.critDamage.final = detailed.critDamage.base + detailed.critDamage.gear;

    // 4. Clamp / Final Adjustments on FINAL values
    detailed.attackSpeed.final = Math.max(0.1, detailed.attackSpeed.final);
    detailed.critChance.final = Math.max(0, Math.min(1, detailed.critChance.final));
    detailed.health.final = this.baseStats.health; 

    return detailed;
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

      // Apply base stat gains using GameStat keys
      this.baseStats.strength += STAT_GAINS_PER_LEVEL.strength ?? 0
      this.baseStats.dexterity += STAT_GAINS_PER_LEVEL.dexterity ?? 0
      this.baseStats.intelligence += STAT_GAINS_PER_LEVEL.intelligence ?? 0
      this.baseStats.constitution += STAT_GAINS_PER_LEVEL.constitution ?? 0
      this.baseStats.defense += STAT_GAINS_PER_LEVEL.defense ?? 0 
      // Crit chance/damage could also increase per level if desired

      // Recalculate base derived stats after attribute gains
      this.calculateInitialDerivedStats()
      // Heal the hero partially or fully on level up? Let's add the HP gain from CON.
      const hpGain = (STAT_GAINS_PER_LEVEL.constitution ?? 0) * 5 // Assuming 5 HP per CON
      this.baseStats.health = Math.min(this.baseStats.maxHealth, this.baseStats.health + hpGain)

    }
    return leveledUp
  }

  // Damage taking logic needs to use effective defense
  takeDamage (damage: number, effectiveDefense: number) {
    const actualDamage = Math.max(0, damage - effectiveDefense)
    this.baseStats.health = Math.max(0, this.baseStats.health - actualDamage)
  }

  // Attack logic needs to incorporate crit
  calculateAttackDamage (effectiveDamage: number, effectiveCritChance: number, effectiveCritDamage: number): { damage: number, isCrit: boolean } {
    const isCrit = Math.random() < effectiveCritChance
    const damage = isCrit ? effectiveDamage * effectiveCritDamage : effectiveDamage
    return { damage: Math.floor(damage), isCrit }
  }

  isAlive (): boolean {
    return this.baseStats.health > 0
  }

  // TODO: Add methods for levelUp (modifies baseStats), etc.
}

export type { HeroStats, DetailedHeroStats }
export { Hero } 