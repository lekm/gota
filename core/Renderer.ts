import type { Hero } from './entities/Hero'
import type { Monster } from './entities/Monster'
import { useInventoryStore } from '@/store/inventoryStore'

class Renderer {
  private context: CanvasRenderingContext2D

  constructor (context: CanvasRenderingContext2D) {
    this.context = context
  }

  getCanvasWidth (): number {
    return this.context.canvas.width
  }

  getCanvasHeight (): number {
    return this.context.canvas.height
  }

  // Clears the canvas
  clear () {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
  }

  private drawHealthBar (x: number, y: number, width: number, height: number, currentHealth: number, maxHealth: number) {
    const healthPercentage = maxHealth > 0 ? currentHealth / maxHealth : 0

    // Background of the health bar (e.g., dark red)
    this.context.fillStyle = '#500'
    this.context.fillRect(x, y, width, height)

    // Foreground of the health bar (green)
    this.context.fillStyle = '#0f0'
    this.context.fillRect(x, y, width * healthPercentage, height)

    // Optional: Add border
    this.context.strokeStyle = '#333'
    this.context.lineWidth = 1
    this.context.strokeRect(x, y, width, height)
  }

  // Draw ONLY game entities
  draw (hero?: Hero | null, monsters?: Monster[]) {
    // Draw background
    this.context.fillStyle = '#222'
    this.context.fillRect(0, 0, this.getCanvasWidth(), this.getCanvasHeight())

    const healthBarWidth = 40
    const healthBarHeight = 5
    const healthBarOffsetY = 20

    // Draw Hero
    if (hero && hero.isAlive()) {
      // Get current effective stats based on equipped items (fetched by GameManager)
      // Note: GameManager now passes updated equipped items to hero methods when needed.
      // Renderer just needs the hero instance itself.
      const effectiveStats = hero.getEffectiveStats(useInventoryStore.getState().equippedItems) // Fetch latest gear state
      
      const heroX = hero.x
      const heroY = hero.y
      const heroSize = 30
      this.context.fillStyle = 'green'
      this.context.fillRect(heroX - heroSize / 2, heroY - heroSize / 2, heroSize, heroSize)
      this.drawHealthBar(
        heroX - healthBarWidth / 2,
        heroY - heroSize / 2 - healthBarOffsetY,
        healthBarWidth,
        healthBarHeight,
        effectiveStats.health, // Use effective health
        effectiveStats.maxHealth // Use effective max health
      )
    }

    // Draw Monsters
    if (monsters) {
      this.context.fillStyle = 'red'
      monsters.forEach(monster => {
        if (!monster.isAlive()) return
        const monsterX = monster.x
        const monsterY = monster.y
        const monsterSize = 20
        this.context.fillRect(monsterX - monsterSize / 2, monsterY - monsterSize / 2, monsterSize, monsterSize)
        this.drawHealthBar(
          monsterX - healthBarWidth / 2,
          monsterY - monsterSize / 2 - healthBarOffsetY + 5,
          healthBarWidth,
          healthBarHeight,
          monster.stats.health,
          monster.stats.maxHealth
        )
      })
    }

    // Removed UI drawing logic (Wave, Timer, Game Over)
  }
}

export { Renderer } 