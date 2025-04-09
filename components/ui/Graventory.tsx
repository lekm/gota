'use client'

import React, { useEffect, useState } from 'react'
import { useInventoryStore } from '@/store/inventoryStore'
import { Item } from '@/core/items/Item'
import { Equipment } from '@/core/items/Equipment'

function Graventory () {
  const [isHydrated, setIsHydrated] = useState(false)
  const { items, equippedItems, clearInventory, equipItem, unequipItem } = useInventoryStore((state) => state)

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

  // Helper to get item display color
  const getItemColor = (item: Item): string => {
    if (item instanceof Equipment) {
      return item.rarityColor
    }
    // Default color for ingredients or other types
    return 'text-gray-300' // Or based on ingredient rarity later
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Graventory</h2>
        <button
          onClick={clearInventory}
          className="text-xs bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded"
          title="Clear all items (DEBUG)"
        >
          Clear
        </button>
      </div>

      <div className="mb-4 border rounded p-2 bg-gray-800">
        <h3 className="text-lg font-semibold mb-1">Equipped</h3>
        <ul className="text-sm space-y-1">
          {(Object.entries(equippedItems) as [string, Equipment | undefined][]).map(([slot, item]) => (
            <li key={slot} className="flex justify-between items-center">
              <span>{slot}: {item ? <strong className={item.rarityColor}>{item.name}</strong> : <i className="text-gray-500">Empty</i>}</span>
              {item && (
                <button
                  onClick={() => unequipItem(item.slot)}
                  className="text-xs bg-yellow-700 hover:bg-yellow-600 text-white px-1 py-0.5 rounded ml-2"
                  title={`Unequip ${item.name}`}
                >
                  Unequip
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-grow flex flex-col border rounded bg-gray-800">
        <h3 className="text-lg font-semibold mb-1 p-2 border-b">Stored Items</h3>
        <ul className="flex-grow overflow-y-auto p-2 space-y-1">
          {items.length === 0 && (
            <li className="text-gray-400 italic text-sm">No items stored...</li>
          )}
          {items.map((item) => (
            <li key={item.id} className="flex justify-between items-center text-sm border-b border-gray-700 pb-1 last:border-b-0">
              <span><strong className={getItemColor(item)}>{item.name}</strong> ({item.type})</span>
              {item.type === 'Equipment' && (
                <button
                  onClick={() => handleEquip(item)}
                  className="text-xs bg-green-700 hover:bg-green-600 text-white px-1 py-0.5 rounded ml-2"
                  title={`Equip ${item.name}`}
                >
                  Equip
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export { Graventory } 