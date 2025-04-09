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

// Reworked slot positions for clarity and no overlap
const slotPositions: Record<EquipmentSlot, string> = {
  // Top to Bottom Center Column
  Hat: 'top-0 left-1/2 -translate-x-1/2',
  'Neck Tatts': 'top-14 left-1/2 -translate-x-1/2',
  Jacket: 'top-28 left-1/2 -translate-x-1/2',
  Apron: 'top-42 left-1/2 -translate-x-1/2',     // Moved below Jacket
  Pants: 'top-56 left-1/2 -translate-x-1/2',     // Moved below Apron
  Shoes: 'top-72 left-1/2 -translate-x-1/2',    // Moved below Pants

  // Left Column (Aligned with Jacket/Apron)
  'Main Hand': 'top-28 left-4',
  'Arm Tatts': 'top-42 left-4',                  

  // Right Column (Aligned with Jacket/Apron)
  'Off Hand': 'top-28 right-4',
  Gloves: 'top-42 right-4',

  // Bottom Corners
  Tobacco: 'bottom-0 left-4',                   // Moved to bottom left
  Drugs: 'bottom-0 right-4'                    // Moved to bottom right
  
  // Back slot is currently removed from EquipmentSlot type, if added back, needs position
}

// Updated order/list of slots to display (ensure all 12 are listed)
const SLOTS_TO_DISPLAY: EquipmentSlot[] = [
  'Hat', 'Neck Tatts', 'Jacket', 'Pants', 'Shoes', 
  'Main Hand', 'Off Hand', 'Arm Tatts', 'Gloves', 'Apron',
  'Tobacco', 'Drugs'
]

// Helper to get item display properties (similar to Graventory)
const getItemDisplay = (item: Equipment | null) => {
  if (!item) return { colorClass: 'border-gray-600', content: '' }
  // Use rarityColor which is already calculated in Equipment class
  const colorClass = `border-${item.rarityColor.replace('text-', '')}` // Use border color
  const content = item.name.substring(0, 2).toUpperCase()
  return { colorClass, content }
}

// EquipmentSlotIcon component remains largely the same, but needs slight style adjustment for potential overlap
function EquipmentSlotIcon ({ slot, item, onUnequip }: {
  slot: EquipmentSlot
  item: Equipment | null
  onUnequip: (slot: EquipmentSlot) => void
}) {
  const { colorClass, content } = getItemDisplay(item)
  const positionClass = slotPositions[slot]

  // Added z-index based on slot for basic layering, adjust if needed
  // Flanking items and bottom items get higher z-index
  const zIndexClass = ['Main Hand', 'Off Hand', 'Arm Tatts', 'Gloves', 'Tobacco', 'Drugs'].includes(slot) ? 'z-10' : 'z-0'
  
  const slotStyle = `absolute w-12 h-12 border-2 rounded flex items-center justify-center ${positionClass} ${item ? colorClass : 'border-dashed border-gray-600'} bg-gray-700 hover:bg-gray-600 transition-colors duration-150 ${zIndexClass}`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Added group class here for button visibility */}
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
            // Display first letter of slot name for empty slots
            <span className="text-gray-500 text-xs">{slot.substring(0, 1)}</span>
          )}
        </div>
      </TooltipTrigger>
      {/* Tooltip Content remains the same */}
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
        {/* Main container - increased min-height again for new layout */}
        <div className="flex-grow border rounded p-2 bg-gray-800 relative min-h-[350px]">
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