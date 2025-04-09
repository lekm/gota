'use client'

import React, { useEffect, useState } from 'react'
import { useInventoryStore } from '@/store/inventoryStore'
import { Item } from '@/core/items/Item'
import { Equipment } from '@/core/items/Equipment'
import { Ingredient } from '@/core/items/Ingredient'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

// Define stackable types
const STACKABLE_TYPES = ['Ingredient', 'Gravy'] // Add 'Gravy' when implemented

// Helper type for grouped items
type GroupedItem = {
  item: Item
  count: number
}

function Graventory () {
  const [isHydrated, setIsHydrated] = useState(false)
  const { items, clearInventory, equipItem } = useInventoryStore((state) => state)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <div>Loading Graventory...</div>
  }

  const handleEquip = (item: Item) => {
    if (item instanceof Equipment) {
      equipItem(item)
    } else {
      console.warn('Cannot equip item of type:', item.type)
    }
  }

  // Group stackable items and keep equipment separate
  const processedItems: GroupedItem[] = items.reduce((acc, currentItem) => {
    // Check if item is stackable
    const isStackable = STACKABLE_TYPES.includes(currentItem.type)

    if (isStackable) {
      // Find if an item with the same name already exists in the accumulator
      const existingItemIndex = acc.findIndex(
        grouped => grouped.item.name === currentItem.name && STACKABLE_TYPES.includes(grouped.item.type)
      )

      if (existingItemIndex > -1) {
        // Increment count if found
        acc[existingItemIndex].count++
      } else {
        // Add new stackable item with count 1
        acc.push({ item: currentItem, count: 1 })
      }
    } else {
      // Add non-stackable items (like Equipment) individually
      acc.push({ item: currentItem, count: 1 })
    }
    return acc
  }, [] as GroupedItem[])

  // Helper to get item display color (adjust if needed for icons)
  const getItemColor = (item: Item): string => {
    if (item instanceof Equipment) {
      return item.rarityColor // Use border color or background for icons?
    }
    // Default color for ingredients or other types
    return 'text-gray-300' // Or based on ingredient rarity later
  }

  // Placeholder Icon Component (can be extracted later)
  const ItemIcon = ({ groupedItem }: { groupedItem: GroupedItem }) => {
    const { item, count } = groupedItem
    const isEquipment = item instanceof Equipment
    const isIngredient = item instanceof Ingredient // Add check for Ingredient
    const colorClass = getItemColor(item)

    // Placeholder style - replace with actual icons later
    const iconStyle = `w-12 h-12 border rounded flex items-center justify-center relative ${
      isEquipment ? `border-${colorClass.replace('text-', '')}` : 'border-gray-500'
    } bg-gray-700 group-hover:bg-gray-600 cursor-pointer` // Use group-hover for tooltip trigger

    // Simple text representation for now
    const iconContent = item.name.substring(0, 2).toUpperCase()

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Added group class for hover */}
          <div className="flex flex-col items-center group">
            <div className={iconStyle} > {/* Removed title={item.name} */}
              <span className={`font-bold text-sm ${colorClass}`}>{iconContent}</span>
              {count > 1 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {count}
                </span>
              )}
            </div>
            {isEquipment && (
              <button
                onClick={(e) => { e.stopPropagation(); handleEquip(item) }} // Stop propagation to prevent tooltip closing
                className="mt-1 text-xs bg-green-700 hover:bg-green-600 text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150" // Show button on hover
                title={`Equip ${item.name}`}
              >
                Equip
              </button>
            )}
            {!isEquipment && <div className="h-[22px] mt-1" />} {/* Placeholder for spacing when no equip button */}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="bg-gray-900 border-gray-700 text-white p-2 rounded shadow-lg max-w-xs">
          {/* Tooltip Content */}
          <p className={`font-bold text-lg mb-1 ${colorClass}`}>{item.name}</p>
          <p className="text-xs text-gray-400 mb-2">Type: {item.type}</p>

          {isEquipment && (
            <div className="text-sm space-y-0.5">
              {/* Display all modifiers */}
              {item.modifiers.length > 0 ? (
                item.modifiers.map((mod, index) => (
                  <p key={index}>{mod.stat}: <span className="font-medium">{mod.value > 0 ? '+' : ''}{mod.value}</span></p>
                ))
              ) : (
                <p className="italic text-gray-400">No stats</p>
              )}
              <p>Rarity: <span className="font-medium">{item.rarity}</span></p>
            </div>
          )}

          {isIngredient && (
            <div className="text-sm space-y-0.5">
              {/* Placeholder Ingredient Info */}
              <p>Description: <span className="italic">A basic ingredient.</span></p> 
              {/* Add rarity or other info later */}
            </div>
          )}

          {count > 1 && (
            <p className="text-xs text-blue-400 mt-2">In Stack: {count}</p>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-2 flex-shrink-0">
          <h2 className="text-xl font-bold">Graventory</h2>
          <button
            onClick={clearInventory}
            className="text-xs bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded"
            title="Clear all items (DEBUG)"
          >
            Clear
          </button>
        </div>

        <div className="flex-grow border rounded bg-gray-800 overflow-hidden p-2">
          {/* Changed from overflow-y-auto p-2 on inner div to allow grid spacing */}
          <div className="h-full overflow-y-auto pr-1"> {/* Added pr-1 for scrollbar spacing */}
            {processedItems.length === 0 ? (
              <p className="text-gray-400 italic text-sm text-center mt-4">No items stored...</p>
            ) : (
              // Use grid layout instead of ul
              <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-3"> {/* Corrected grid columns and gap */}
                {processedItems.map((groupedItem) => (
                   <ItemIcon key={groupedItem.item.id} groupedItem={groupedItem} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export { Graventory } 