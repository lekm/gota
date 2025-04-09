'use client'

import React from 'react'
import { useGameSessionStore } from '@/store/gameSessionStore'
import type { GameStat } from '@/core/types/stats'
import type { DetailedHeroStats } from '@/core/entities/Hero'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Stat Descriptions Map
const STAT_DESCRIPTIONS: Partial<Record<GameStat, string>> = {
  strength: 'Increases physical Damage.',
  dexterity: 'Increases Attack Speed and Crit Chance.',
  intelligence: 'Increases effectiveness of special skills (Not Implemented).',
  constitution: 'Increases Maximum Health Points.',
  health: 'Current life points.',
  maxHealth: 'Maximum possible life points.',
  damage: 'Base physical damage dealt per attack.',
  attackSpeed: 'Number of attacks performed per second.',
  defense: 'Reduces incoming physical damage.',
  critChance: 'Chance to land a critical hit for bonus damage.',
  critDamage: 'Damage multiplier applied on a critical hit.'
};

// Display Names (Keep this separate for rendering)
const STAT_DISPLAY_NAMES: Partial<Record<GameStat, string>> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  intelligence: 'Intelligence',
  constitution: 'Constitution',
  health: 'Health',
  maxHealth: 'Max Health',
  damage: 'Damage',
  attackSpeed: 'Attack Speed',
  defense: 'Defense',
  critChance: 'Crit Chance',
  critDamage: 'Crit Damage'
};

// Use keyof DetailedHeroStats for the display order
const STATS_TO_DISPLAY_ORDER: Array<keyof DetailedHeroStats> = [
  'strength', 'dexterity', 'intelligence', 'constitution', // Primary
  'health', // Current HP
  'maxHealth', // Display Max HP explicitly now
  'damage', 'attackSpeed', 'defense', 'critChance', 'critDamage' // Other derived
];

function HeroStatsDisplay () {
  // Get the detailed stats object from the store
  const detailedHeroStats = useGameSessionStore((state) => state.heroStats) as DetailedHeroStats | null

  if (!detailedHeroStats) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Hero Stats</h2>
        <p className="text-gray-400 italic">No hero active...</p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div>
        <h2 className="text-xl font-bold mb-4">Hero Stats</h2>
        <ul className="text-sm space-y-1">
          {STATS_TO_DISPLAY_ORDER.map((key) => {
            const statBreakdown = detailedHeroStats[key];
            const displayName = STAT_DISPLAY_NAMES[key];
            const description = STAT_DESCRIPTIONS[key];

            if (!displayName || statBreakdown === undefined) return null;
            
            const value = statBreakdown.final; // Use the final value for display

            // Hide zero for certain stats if desired (adjust logic as needed)
            if (value === 0 && !['strength', 'dexterity', 'intelligence', 'constitution', 'defense', 'health'].includes(key)) {
              return null;
            }

            // --- Formatting --- 
            let displayValue: string | number = value;
            let valueTooltipContent: React.ReactNode = null;

            if (key === 'health') {
              // For current health, tooltip might not be very useful, just show current/max
              const maxHealthFinal = detailedHeroStats.maxHealth?.final ?? 0;
              displayValue = `${Math.round(value)} / ${Math.round(maxHealthFinal)}`;
              valueTooltipContent = `Current / Max Health`;
            } else if (key === 'maxHealth') {
              // Show breakdown for Max Health
              displayValue = Math.round(value);
              valueTooltipContent = (
                <div>
                  <p>Base: {Math.round(statBreakdown.base)}</p>
                  <p>Gear: {Math.round(statBreakdown.gear)}</p>
                  {/* <p>From CON: {Math.round(detailedHeroStats.constitution.final * 5)}</p> */} 
                  <hr className="my-1 border-gray-600" />
                  <p>Total: {Math.round(value)}</p>
                </div>
              );
            } else if (key === 'attackSpeed') {
              displayValue = `${value.toFixed(2)}/s`;
              valueTooltipContent = (
                 <div>
                  <p>Base: {statBreakdown.base.toFixed(2)}</p>
                  <p>Gear: {statBreakdown.gear.toFixed(2)}</p>
                  {/* <p>From DEX: {(detailedHeroStats.dexterity.final * 0.02).toFixed(2)}</p> */}
                  <hr className="my-1 border-gray-600" />
                  <p>Total: {value.toFixed(2)}/s</p>
                </div>
              );
            } else if (key === 'critChance' || key === 'critDamage') {
              displayValue = `${(value * 100).toFixed(key === 'critChance' ? 1 : 0)}%`;
              valueTooltipContent = (
                 <div>
                  <p>Base: {(statBreakdown.base * 100).toFixed(key === 'critChance' ? 1 : 0)}%</p>
                  <p>Gear: {(statBreakdown.gear * 100).toFixed(key === 'critChance' ? 1 : 0)}%</p>
                  <hr className="my-1 border-gray-600" />
                  <p>Total: {displayValue}</p>
                </div>
              );
            } else {
               // Default display for STR, DEX, INT, CON, Damage, Defense
               displayValue = Number.isInteger(value) ? value : value.toFixed(1);
               valueTooltipContent = (
                 <div>
                  <p>Base: {Number.isInteger(statBreakdown.base) ? statBreakdown.base : statBreakdown.base.toFixed(1)}</p>
                  <p>Gear: {Number.isInteger(statBreakdown.gear) ? statBreakdown.gear : statBreakdown.gear.toFixed(1)}</p>
                  <hr className="my-1 border-gray-600" />
                  <p>Total: {displayValue}</p>
                </div>
              );
            }

            return (
              <li key={key} className="flex justify-between">
                {/* Tooltip for Stat Name */}                 
                <Tooltip>
                  <TooltipTrigger asChild>
                     <span className="cursor-help border-b border-dotted border-gray-500">{displayName}:</span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs text-sm">
                    <p>{description || 'No description available.'}</p>
                  </TooltipContent>
                </Tooltip>
                
                {/* Tooltip for Stat Value */} 
                <Tooltip>
                   <TooltipTrigger asChild>
                     <span className="font-medium cursor-help">{displayValue}</span>
                   </TooltipTrigger>
                   <TooltipContent side="right" className="max-w-xs text-sm">
                     {valueTooltipContent || 'Calculation details unavailable.'} 
                   </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </div>
    </TooltipProvider>
  )
}

export { HeroStatsDisplay } 