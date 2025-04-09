import { Renderer } from './Renderer'
import { Hero, type HeroStats } from './entities/Hero'
import { Monster } from './entities/Monster'
import type { Item } from './items/Item' // Import Item type
import { useInventoryStore, type EquippedItems } from '@/store/inventoryStore' // Import zustand store and EquippedItems type
import { useCombatLogStore } from '@/store/combatLogStore' // Import combat log store
import { useGameSessionStore, type GameStatus, type GameOverReason } from '@/store/gameSessionStore' // Import session store and GameStatus

class GameManager {
  private renderer: Renderer
  private animationFrameId: number | null = null
  private isRunning: boolean = false

  // Game state variables
  private hero: Hero | null = null
  private monsters: Monster[] = []
  private sessionTimeLimit: number = 120 // seconds (2 minutes)
  private elapsedTime: number = 0
  private waveNumber: number = 1 // Start at wave 1

  // Timing for attacks
  private lastHeroAttackTime: number = 0
  private lastMonsterAttackTimes: Map<Monster, number> = new Map()
  private lastTimestamp: number = 0

  // Reference to the store action (obtained outside constructor)
  private addItemsToInventory: (items: Item[]) => void
  private addLogMessage: (message: string) => void // Reference to log store action
  private updateSessionStats: (stats: HeroStats | null) => void // Ref to session store action
  private setSessionWave: (wave: number) => void
  private setSessionTime: (time: number) => void
  private setSessionGameOver: (isOver: boolean) => void
  private setSessionGameState: (status: GameStatus, reason?: GameOverReason) => void // Correct signature
  private resetSessionStore: () => void

  constructor (context: CanvasRenderingContext2D) {
    this.renderer = new Renderer(context)
    // Get actions from stores
    this.addItemsToInventory = useInventoryStore.getState().addItems
    this.addLogMessage = useCombatLogStore.getState().addMessage
    // Get session store actions
    const sessionStoreActions = useGameSessionStore.getState()
    this.updateSessionStats = sessionStoreActions.updateHeroStats
    this.setSessionWave = sessionStoreActions.setWaveNumber
    this.setSessionTime = sessionStoreActions.setTimeRemaining
    this.setSessionGameOver = sessionStoreActions.setGameOver
    this.setSessionGameState = sessionStoreActions.setGameState
    this.resetSessionStore = sessionStoreActions.resetSession

    // Don't initialize game immediately, wait for start() call
    // this.initializeGameState(context.canvas.width, context.canvas.height)
  }

  private initializeGameState (canvasWidth: number, canvasHeight: number) {
    // Reset stores (resetSessionStore sets gameState to NotStarted)
    this.resetSessionStore()
    useCombatLogStore.getState().clearLog()
    // State is set to InProgress by start() method

    // Reset state for a new game
    this.elapsedTime = 0
    this.waveNumber = 1
    this.lastHeroAttackTime = 0
    this.lastMonsterAttackTimes.clear()
    this.lastTimestamp = 0

    // Get currently equipped items from the store
    const equippedItems = useInventoryStore.getState().equippedItems

    // Create the hero - Pass equipped items to constructor or stat calculation
    this.hero = new Hero(100, canvasHeight / 2, equippedItems) // Modify Hero constructor later if needed
    this.updateSessionStats(this.hero.getEffectiveStats()) // Update store with calculated stats

    // Create the first wave of monsters
    this.spawnWave(canvasWidth, canvasHeight)

    // console.log('Game state initialized:', this.hero, this.monsters)
  }

  private spawnWave (canvasWidth: number, canvasHeight: number) {
    // Simple spawning logic for wave 1
    // TODO: Expand this for different waves
    this.monsters = [
      new Monster(
        canvasWidth - 150,
        canvasHeight / 2,
        `Angry Asparagus (W${this.waveNumber})`,
        // Example: Scale health slightly based on wave
        { health: 20 + (this.waveNumber - 1) * 5, maxHealth: 20 + (this.waveNumber - 1) * 5 }
      )
    ]
    this.setSessionWave(this.waveNumber) // Update store wave number
    this.addLogMessage(`Wave ${this.waveNumber} begins!`) // Log wave start
    // console.log(`Spawning Wave ${this.waveNumber}`)
  }

  private gameLoop = (timestamp: number) => {
    if (!this.isRunning || useGameSessionStore.getState().gameState !== 'InProgress') return // Check state

    // Calculate delta time for time-based calculations
    const deltaTime = (timestamp - (this.lastTimestamp || timestamp)) / 1000 // in seconds
    this.lastTimestamp = timestamp

    // 1. Update game state
    this.update(deltaTime)

    // 2. Render the current game state
    this.render()

    // 3. Request the next frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop)
  }

  private update (deltaTime: number) {
    // Check for game over conditions
    if (useGameSessionStore.getState().gameState !== 'InProgress') return // Ensure game is running

    if (!this.hero || !this.hero.isAlive() || this.elapsedTime >= this.sessionTimeLimit) {
      // Check isRunning to prevent multiple gameOver calls if state update is slow
      if (this.isRunning) {
        this.gameOver(this.hero?.isAlive() ?? false)
      }
      return
    }

    // Increment elapsed time
    this.elapsedTime += deltaTime

    // Update time and sync with store
    const timeRemaining = Math.max(0, this.sessionTimeLimit - this.elapsedTime)
    this.setSessionTime(timeRemaining)

    // Sync hero stats - use effective stats including equipment
    if (this.hero) {
        // Fetch equipped items again in case they changed mid-session (though not possible yet)
        const equippedItems = useInventoryStore.getState().equippedItems
        this.updateSessionStats(this.hero.getEffectiveStats(equippedItems))
    }

    const currentTime = performance.now()

    // --- Hero Attack Logic --- Uses hero.getEffectiveStats() now
    const targetMonster = this.monsters.find(m => m.isAlive())
    if (this.hero && targetMonster) { // Check hero exists
      const effectiveStats = this.hero.getEffectiveStats(useInventoryStore.getState().equippedItems) // Pass current gear
      const heroAttackCooldown = 1 / effectiveStats.attackSpeed
      if ((currentTime - this.lastHeroAttackTime) / 1000 >= heroAttackCooldown) {
        const damageDealt = effectiveStats.damage
        targetMonster.takeDamage(damageDealt)
        this.addLogMessage(`Hero hits ${targetMonster.name} for ${damageDealt} damage.`)
        if (!targetMonster.isAlive()) {
          this.addLogMessage(`${targetMonster.name} defeated!`)
        }
        this.lastHeroAttackTime = currentTime
      }
    }

    // --- Monster Logic ---
    this.monsters.forEach(monster => {
      if (!monster.isAlive()) return
      const dx = this.hero!.x - monster.x // Non-null assertion ok if hero must exist here
      const moveSpeed = 50
      if (Math.abs(dx) > 50) {
        monster.x += Math.sign(dx) * moveSpeed * deltaTime
      } else {
        // Attack
        const monsterAttackCooldown = 1 / monster.stats.attackSpeed
        const lastAttackTime = this.lastMonsterAttackTimes.get(monster) || 0
        if ((currentTime - lastAttackTime) / 1000 >= monsterAttackCooldown) {
          const damageDealt = monster.stats.damage
          // Apply damage using effective stats for defense
          const equippedItems = useInventoryStore.getState().equippedItems
          this.hero!.takeDamage(damageDealt, equippedItems)
          this.addLogMessage(`${monster.name} hits Hero for ${damageDealt} damage.`)
          if (!this.hero!.isAlive()) {
            this.addLogMessage(`Hero has been defeated!`)
          }
          this.lastMonsterAttackTimes.set(monster, currentTime)
        }
      }
    })

    // --- Handle Monster Deaths & Loot --- 
    const newlyDeadMonsters = this.monsters.filter(m => !m.isAlive() && this.lastMonsterAttackTimes.get(m) !== -1) // Ensure not already processed
    newlyDeadMonsters.forEach(deadMonster => {
      const loot = deadMonster.generateLoot()
      if (loot.length > 0) {
        // console.log('Loot dropped:', loot)
        this.addItemsToInventory(loot)
        loot.forEach(item => this.addLogMessage(`Looted: ${item.name}`))
      }
      // Mark as processed
      this.lastMonsterAttackTimes.set(deadMonster, -1)
    })

    // --- Cleanup Dead Monsters ---
    const aliveMonsters = this.monsters.filter(m => m.isAlive())
    if (aliveMonsters.length < this.monsters.length) {
      const deadCount = this.monsters.length - aliveMonsters.length
      // console.log(`Cleaning up ${deadCount} dead monsters`);
      // Remove processed dead monsters from the attack timer map
      this.lastMonsterAttackTimes.forEach((time, monster) => {
        if (time === -1 || !monster.isAlive()) { // Check for marker or if somehow missed
          this.lastMonsterAttackTimes.delete(monster)
        }
      })
      this.monsters = aliveMonsters
    }

    // --- Check for Wave Clear ---
    if (this.monsters.length === 0 && this.isRunning) { // Ensure game is still running
      this.addLogMessage(`Wave ${this.waveNumber} cleared!`);
      // console.log(`Wave ${this.waveNumber} cleared!`);
      this.waveNumber++
      this.spawnWave(this.renderer.getCanvasWidth(), this.renderer.getCanvasHeight())
    }

    // TODO: Check win conditions (timer is handled above, all waves cleared?)
  }

  private gameOver (heroSurvived: boolean) {
    const reason: GameOverReason = heroSurvived ? 'TimeUp' : 'Defeat'
    this.setSessionGameState('GameOver', reason) // Pass the reason correctly
    if (!heroSurvived) {
      this.addLogMessage('Session ended: Hero defeated!')
      // console.log('Hero was defeated!')
    } else if (this.elapsedTime >= this.sessionTimeLimit) {
      this.addLogMessage('Session ended: Time limit reached!')
      // console.log('Time limit reached!')
    }
    // console.log('Final Inventory:', useInventoryStore.getState().items)
    this.updateSessionStats(null) // Clear hero stats on game over
    this.stop() // Stop the internal loop, state handles UI
  }

  private render () {
    this.renderer.clear()
    // Renderer can now potentially get state from store if needed,
    // but for now, keep passing essential entities
    this.renderer.draw(this.hero, this.monsters) // Pass only entities
  }

  start () {
    // Check only internal 'isRunning' flag now
    if (this.isRunning) {
        console.warn('GameManager.start() called but already running.');
        return;
    }
    console.log('Starting game session via GameManager.start()...')
    // Initialize must happen first
    this.initializeGameState(this.renderer.getCanvasWidth(), this.renderer.getCanvasHeight())
    
    // Set internal running flag
    this.isRunning = true
    
    // NOW set the global state for UI reactions
    this.setSessionGameState('InProgress') 
    
    this.lastTimestamp = performance.now()
    this.animationFrameId = requestAnimationFrame(this.gameLoop)
  }

  stop () { // Internal stop, doesn't change game state directly
    if (!this.isRunning) return
    console.log('Stopping internal game loop...')
    this.isRunning = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    // Don't reset stats here, gameOver or restart logic handles state changes
  }
}

export { GameManager }