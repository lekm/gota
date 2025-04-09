import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Item } from '@/core/items/Item'
import type { Equipment, EquipmentSlot } from '@/core/items/Equipment'

// Type definition for equipped items map
type EquippedItems = Partial<Record<EquipmentSlot, Equipment>>

interface InventoryState {
  items: Item[] // General inventory
  equippedItems: EquippedItems // Items currently equipped by the hero
  addItem: (item: Item) => void
  addItems: (items: Item[]) => void
  removeItemById: (itemId: string) => void // Needed for equipping
  equipItem: (item: Equipment) => void
  unequipItem: (slot: EquipmentSlot) => void
  clearInventory: () => void
  // TODO: Add methods for removing items, equipping items etc.
}

// Create the store with persistence
const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      equippedItems: {},
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      addItems: (itemsToAdd) => set((state) => ({
        items: [...state.items, ...itemsToAdd]
      })),
      removeItemById: (itemId) => set((state) => ({
        items: state.items.filter(item => item.id !== itemId)
      })),
      equipItem: (itemToEquip) => {
        const currentEquipped = get().equippedItems
        const slot = itemToEquip.slot
        const currentlyEquippedItem = currentEquipped[slot]

        // Remove item from general inventory
        get().removeItemById(itemToEquip.id)

        set((state) => {
          const newItems = [...state.items]
          // If an item is already in the slot, unequip it first (move back to inventory)
          if (currentlyEquippedItem) {
            newItems.push(currentlyEquippedItem)
          }
          return {
            equippedItems: { ...state.equippedItems, [slot]: itemToEquip },
            items: newItems
          }
        })
      },
      unequipItem: (slot) => {
        const equippedItem = get().equippedItems[slot]
        if (!equippedItem) return // Nothing to unequip

        set((state) => ({
          equippedItems: { ...state.equippedItems, [slot]: undefined }, // Remove from equipped
          items: [...state.items, equippedItem] // Add back to inventory
        }))
      },
      clearInventory: () => set({ items: [], equippedItems: {} })
    }),
    {
      name: 'graventory-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // Use localStorage
      // TODO: Need custom serialization for class instances?
      // By default, Zustand JSON stringifies. Class methods might be lost.
      // We might need to serialize to plain objects and re-instantiate on load.
      // For now, basic properties should persist.
    }
  )
)

export { useInventoryStore }
export type { EquippedItems } 