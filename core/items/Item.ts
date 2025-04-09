import { v4 as uuidv4 } from 'uuid' // Use UUID for unique item instances

// Base class for all items
class Item {
  id: string // Unique identifier for this specific item instance
  baseId: string // Identifier for the type of item (e.g., 'spatula_of_slicing')
  name: string
  type: 'Equipment' | 'Ingredient' | 'Gravy' | 'Other'
  description: string

  constructor (
    baseId: string,
    name: string,
    type: 'Equipment' | 'Ingredient' | 'Gravy' | 'Other',
    description: string
  ) {
    this.id = uuidv4()
    this.baseId = baseId
    this.name = name
    this.type = type
    this.description = description
  }
}

export { Item } 