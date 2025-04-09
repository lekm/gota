'use client'

import React from 'react'
import { useInventoryStore } from '@/store/inventoryStore'
import type { EquipmentSlot } from '@/core/items/Equipment'
import { Equipment } from '@/core/items/Equipment'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

// Define slot positions (adjust Tailwind classes as needed for layout)
const slotPositions: Record<EquipmentSlot, string> = {
  Helm: 'top-2 left-1/2 -translate-x-1/2', // Centered top
  Body: 'top-16 left-1/2 -translate-x-1/2', // Centered below helm
  Weapon: 'top-16 left-4', // Left side
  Accessory: 'top-16 right-4' // Right side
}

// Define the order for mapping if needed, though positions dictate layout now
const SLOTS_TO_DISPLAY: EquipmentSlot[] = ['Helm', 'Body', 'Weapon', 'Accessory']

// Helper to get item display properties (similar to Graventory)
const getItemDisplay = (item: Equipment | null) => {
  if (!item) return { colorClass: 'border-gray-600', content: '' }
  const colorClass = `border-${item.rarityColor.replace('text-', '')}` // Use border color
  const content = item.name.substring(0, 2).toUpperCase()
  return { colorClass, content }
}

// Placeholder Slot Icon Component
function EquipmentSlotIcon ({ slot, item, onUnequip }: {
  slot: EquipmentSlot
  item: Equipment | null
  onUnequip: (slot: EquipmentSlot) => void
}) {
  const { colorClass, content } = getItemDisplay(item)
  const positionClass = slotPositions[slot]

  const slotStyle = `absolute w-12 h-12 border-2 rounded flex items-center justify-center ${positionClass} ${item ? colorClass : 'border-dashed border-gray-600'} bg-gray-700 group-hover:bg-gray-600`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`${slotStyle} group`} title={''}>
          {item ? (
            <>
              <span className={`font-bold text-sm ${item.rarityColor}`}>{content}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onUnequip(slot) }}
                className="absolute -top-1 -right-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                title={`Unequip ${item.name}`}
              >
                X
              </button>
            </>
          ) : (
            <span className="text-gray-500 text-xs">{slot.substring(0, 1)}</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" align="center" className="bg-gray-900 border-gray-700 text-white p-2 rounded shadow-lg max-w-xs">
        <p className="font-bold text-lg mb-1">{slot}</p>
        {item ? (
          <>
            <p className={`font-semibold text-md mb-1 ${item.rarityColor}`}>{item.name}</p>
            <div className="text-sm space-y-0.5">
              {item.modifiers.length > 0 ? (
                item.modifiers.map((mod, index) => (
                  <p key={index}>{mod.stat}: <span className="font-medium">{mod.value > 0 ? '+' : ''}{mod.value}</span></p>
                ))
              ) : (
                <p className="italic text-gray-400">No stats</p>
              )}
              <p>Rarity: <span className="font-medium">{item.rarity}</span></p>
            </div>
          </>
        ) : (
          <p className="italic text-gray-400">Empty Slot</p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

function HeroPaperDoll () {
  const equippedItems = useInventoryStore((state) => state.equippedItems)
  const unequipItem = useInventoryStore((state) => state.unequipItem)

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full">
        <h2 className="text-xl font-bold mb-2 flex-shrink-0">Equipment</h2>
        {/* Main container for the paper doll layout - relative positioning */}
        <div className="flex-grow border rounded p-2 bg-gray-800 relative min-h-[150px]">
          {SLOTS_TO_DISPLAY.map((slot) => (
            <EquipmentSlotIcon
              key={slot}
              slot={slot}
              item={equippedItems[slot] || null}
              onUnequip={unequipItem}
            />
          ))}
          {/* Optional: Add a faint character outline SVG/image later */}
        </div>
      </div>
    </TooltipProvider>
  )
}

export { HeroPaperDoll } 