import { Item } from './Item'

class Ingredient extends Item {
  // Ingredients might have specific properties later (e.g., quality, stack size)

  constructor (baseId: string, name: string, description: string) {
    super(baseId, name, 'Ingredient', description)
  }
}

export { Ingredient } 