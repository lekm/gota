'use client'

import React from 'react'
// TODO: Import Ingredient and Gravy types when created
// import { useInventoryStore } from '@/store/inventoryStore' // Might need inventory access later

function CraftingStation () {
  // TODO: State for selected ingredients, selected recipe
  // const ingredients = useInventoryStore(state => state.items.filter(i => i.type === 'Ingredient'))

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-2">Gravy Crafting</h2>

      <div className="flex-grow grid grid-cols-2 gap-4 border rounded p-2 bg-gray-800">
        {/* Left Side: Ingredients & Recipes */}
        <div className="flex flex-col space-y-4">
          {/* Ingredient Selection Area */}
          <div className="border rounded p-2 h-1/2 bg-gray-700">
            <h3 className="text-lg font-semibold mb-1">Ingredients</h3>
            <p className="text-xs text-gray-400 italic">Select ingredients from Graventory (placeholder)</p>
            {/* Placeholder: List/Grid of available ingredients */}
            <ul className="text-sm mt-1">
              <li>Mystic Roux (stub)</li>
              <li>Salt Shard (stub)</li>
            </ul>
          </div>

          {/* Recipe List Area */}
          <div className="border rounded p-2 h-1/2 bg-gray-700 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-1">Recipes</h3>
            {/* Placeholder: List of known gravy recipes */}
            <ul className="text-sm mt-1 space-y-1">
              <li className="cursor-pointer hover:bg-gray-600 p-1 rounded">Basic Damage Gravy (stub)</li>
              <li className="cursor-pointer hover:bg-gray-600 p-1 rounded">Basic Health Gravy (stub)</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Recipe Details & Craft Button */}
        <div className="border rounded p-2 flex flex-col justify-between bg-gray-700">
          <div>
            <h3 className="text-lg font-semibold mb-1">Recipe Details</h3>
            {/* Placeholder: Show details of selected recipe */}
            <p className="text-sm text-gray-400 italic">Select a recipe to view details...</p>
            {/* Example Detail Structure */}
            {/*
            <p><strong>Basic Damage Gravy</strong></p>
            <p className="text-xs">Requires: 1x Mystic Roux, 1x Salt Shard</p>
            <p className="text-xs">Effect: +5 Damage for 30s</p>
            */}
          </div>

          <button
            disabled // Disabled for now
            className="w-full bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded mt-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Craft Gravy (Disabled)
          </button>
        </div>
      </div>
    </div>
  )
}

export { CraftingStation } 