'use client'

import React from 'react'
import { useInventoryStore } from '@/store/inventoryStore'
import type { EquipmentSlot } from '@/core/items/Equipment'

// Define the order and display names for slots
const SLOTS_ORDER: EquipmentSlot[] = ['Helm', 'Body', 'Weapon', 'Accessory']

function HeroPaperDoll () {
  const equippedItems = useInventoryStore((state) => state.equippedItems)
  const unequipItem = useInventoryStore((state) => state.unequipItem)

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-2 flex-shrink-0">Equipment</h2>
      <div className="flex-grow border rounded p-2 bg-gray-800 space-y-2 overflow-y-auto">
        {SLOTS_ORDER.map((slot) => {
          const item = equippedItems[slot]
          return (
            <div key={slot} className="flex justify-between items-center p-1 border-b border-gray-700 last:border-b-0">
              <span className="text-sm font-semibold text-gray-400 w-20">{slot}:</span>
              {item ? (
                <div className="flex-grow flex justify-between items-center ml-2">
                  <span className={`text-sm font-medium ${item.rarityColor}`}>{item.name}</span>
                  <button 
                    onClick={() => unequipItem(slot)}
                    className="text-xs bg-yellow-700 hover:bg-yellow-600 text-white px-1 py-0.5 rounded ml-2"
                    title={`Unequip ${item.name}`}
                  >
                    X
                  </button>
                </div>
              ) : (
                <span className="text-sm italic text-gray-500 ml-2">Empty</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { HeroPaperDoll } 