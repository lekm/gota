import { Renderer } from './Renderer'
import { Hero, type HeroStats, type DetailedHeroStats } from './entities/Hero'
import { Monster } from './entities/Monster'
import type { Item } from './items/Item' // Import Item type
import { useInventoryStore, type EquippedItems } from '@/store/inventoryStore' // Import zustand store and EquippedItems type
import { useCombatLogStore } from '@/store/combatLogStore' // Import combat log store
import { useGameSessionStore, type GameStatus, type GameOverReason, type HeroXPInfo } from '@/store/gameSessionStore' // Import session store and GameStatus, GameOverReason
import type { GravyEffect } from '@/core/types/effects'
import { BASE_GRAVIES, createGravyInstance } from '@/core/items/gravyDefinitions'

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
  private updateSessionStats: (stats: DetailedHeroStats | null) => void // Ref to session store action
  private setSessionWave: (wave: number) => void
  private setSessionTime: (time: number) => void
  private setSessionGameOver: (isOver: boolean) => void
  private setSessionGameState: (status: GameStatus, reason?: GameOverReason) => void // Correct signature
  private setHeroLevelAndXPStore: (level: number, xpInfo: HeroXPInfo | null) => void // Ref to new action
  private resetSessionStore: () => void
  private addActiveEffect: (effect: GravyEffect) => void
  private updateActiveEffects: (deltaTime: number) => void

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
    this.setHeroLevelAndXPStore = sessionStoreActions.setHeroLevelAndXP // Get new action
    this.resetSessionStore = sessionStoreActions.resetSession
    this.addActiveEffect = sessionStoreActions.addActiveEffect // Get new action
    this.updateActiveEffects = sessionStoreActions.updateActiveEffects // Get new action

    // Don't initialize game immediately, wait for start() call
    // this.initializeGameState(context.canvas.width, context.canvas.height)
  }

  private initializeGameState (canvasWidth: number, canvasHeight: number) {
    console.log('[GameManager] Initializing game state...');
    this.resetSessionStore() // Resets stats, wave, time, effects etc.
    useCombatLogStore.getState().clearLog()

    this.elapsedTime = 0
    this.waveNumber = 1
    this.lastHeroAttackTime = 0
    this.lastMonsterAttackTimes.clear()
    this.lastTimestamp = 0

    const equippedItems = useInventoryStore.getState().equippedItems
    console.log('[GameManager] Creating Hero...');
    this.hero = new Hero(100, canvasHeight / 2, equippedItems)
    console.log('[GameManager] Hero created:', this.hero);

    console.log('[GameManager] Syncing initial stats...');
    const initialDetailedStats = this.hero.getEffectiveStats(equippedItems, []) // Start with no effects
    this.updateSessionStats(initialDetailedStats)
    this.setHeroLevelAndXPStore(this.hero.level, { currentXP: this.hero.currentXP, xpToNextLevel: this.hero.xpToNextLevel })
    this.setSessionWave(this.waveNumber)
    this.setSessionTime(this.sessionTimeLimit)
    console.log('[GameManager] Initial stats synced.');

    console.log('[GameManager] Spawning wave...');
    this.spawnWave(canvasWidth, canvasHeight)
    console.log('[GameManager] Wave spawned. Monsters:', this.monsters);

    console.log('[GameManager] Game state initialization complete.');
  }

  private spawnWave (canvasWidth: number, canvasHeight: number) {
    this.monsters = [] // Clear previous wave
    const monsterCount = 1 + Math.floor(this.waveNumber / 5) // Example: More monsters every 5 waves
    
    for (let i = 0; i < monsterCount; i++) {
        // Simple positioning variation
        const spawnX = canvasWidth - 150 - (i * 40)
        const spawnY = canvasHeight / 2 + (Math.random() * 60 - 30)
        this.monsters.push(
          new Monster(
            spawnX,
            spawnY,
            `Angry Asparagus`, // Base name, maybe add index later
            this.waveNumber // Pass current wave number
          )
        )
    }
    
    this.setSessionWave(this.waveNumber)
    this.addLogMessage(`Wave ${this.waveNumber} begins! (${monsterCount} monsters)`) 
  }

  private gameLoop = (timestamp: number) => {
    const currentState = useGameSessionStore.getState().gameState;
    // Log loop entry and state check
    console.log(`[GameManager] gameLoop running. Timestamp: ${timestamp}, isRunning: ${this.isRunning}, gameState: ${currentState}`); 

    if (!this.isRunning || currentState !== 'InProgress') {
        // Log WHY the loop is exiting
        console.log(`[GameManager] gameLoop exit condition met. isRunning: ${this.isRunning}, gameState: ${currentState}`); 
        return; 
    }

    const deltaTime = (timestamp - (this.lastTimestamp || timestamp)) / 1000 // in seconds
    this.lastTimestamp = timestamp

    // Log before update and render
    // console.log(`[GameManager] DeltaTime: ${deltaTime.toFixed(4)}s`);
    try {
        this.update(deltaTime);
        this.render();
    } catch (error) {
        console.error("[GameManager] Error in update/render loop:", error);
        this.stop(); // Stop the loop on error
        this.setSessionGameState('NotStarted'); // Reset state
    }

    this.animationFrameId = requestAnimationFrame(this.gameLoop)
  }

  private update (deltaTime: number) {
    // console.log('[GameManager] update starting...');
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

    const currentTime = performance.now()
    const equippedItems = useInventoryStore.getState().equippedItems
    const activeEffects = useGameSessionStore.getState().activeEffects
    const effectiveStats = this.hero?.getEffectiveStats(equippedItems, activeEffects)

    // Update active effects duration FIRST
    this.updateActiveEffects(deltaTime);

    // Re-sync store stats every frame
    if (this.hero && effectiveStats) {
        this.updateSessionStats(effectiveStats)
    }

    // --- Hero Attack Logic ---
    const targetMonster = this.monsters.find(m => m.isAlive());

    if (this.hero && effectiveStats && targetMonster) {
      const heroAttackCooldown = 1 / effectiveStats.attackSpeed.final
      if ((currentTime - this.lastHeroAttackTime) / 1000 >= heroAttackCooldown) {
        const { damage: damageDealt, isCrit } = this.hero.calculateAttackDamage(
          effectiveStats.damage.final,
          effectiveStats.critChance.final,
          effectiveStats.critDamage.final
        );
        
        targetMonster.takeDamage(damageDealt)
        const critText = isCrit ? ' (CRIT!)' : ''
        this.addLogMessage(`Hero hits ${targetMonster.name} for ${damageDealt} damage${critText}.`)
        if (!targetMonster.isAlive()) {
          this.addLogMessage(`${targetMonster.name} defeated!`)
        }
        this.lastHeroAttackTime = currentTime
      }
    }

    // --- Monster Logic ---
    this.monsters.forEach(monster => {
      if (!monster.isAlive() || !this.hero || !effectiveStats) return
      
      const dx = this.hero.x - monster.x
      const moveSpeed = 50 // Example speed
      const attackRange = 50 // Example range

      if (Math.abs(dx) > attackRange) {
        // Move towards hero
        monster.x += Math.sign(dx) * moveSpeed * deltaTime
      } else {
        // Attack Hero
        const monsterAttackCooldown = 1 / monster.stats.attackSpeed
        const lastAttackTime = this.lastMonsterAttackTimes.get(monster) || 0
        if ((currentTime - lastAttackTime) / 1000 >= monsterAttackCooldown) {
          const damageDealt = monster.stats.damage
          this.hero.takeDamage(damageDealt, effectiveStats.defense.final)
          this.addLogMessage(`${monster.name} hits Hero for ${damageDealt} damage.`)
          
          // Sync stats immediately after damage taken
          const updatedDetailedStats = this.hero.getEffectiveStats(equippedItems, activeEffects)
          this.updateSessionStats(updatedDetailedStats)
          
          if (!this.hero.isAlive()) {
            this.addLogMessage('Hero has been defeated!');
            this.setSessionGameState('GameOver', 'HeroDefeated') 
            this.stop()
            return;
          }
          this.lastMonsterAttackTimes.set(monster, currentTime)
        }
      }
    })

    // --- Handle Monster Deaths & Loot & XP --- 
    const newlyDeadMonsters = this.monsters.filter(m => !m.isAlive() && this.lastMonsterAttackTimes.get(m) !== -1)
    if (newlyDeadMonsters.length > 0 && this.hero) {
        newlyDeadMonsters.forEach(deadMonster => {
            const { loot, xp } = deadMonster.getDeathRewards()
            
            if (loot.length > 0) {
                this.addItemsToInventory(loot)
                loot.forEach(item => this.addLogMessage(`Looted: ${item.name}`))
            }
            
            if (xp > 0 && this.hero) {
                const leveledUp = this.hero.gainXP(xp)
                this.addLogMessage(`Gained ${xp} XP.`)
                this.setHeroLevelAndXPStore(this.hero.level, { currentXP: this.hero.currentXP, xpToNextLevel: this.hero.xpToNextLevel })
                if (leveledUp) {
                    this.addLogMessage(`HERO LEVELED UP to ${this.hero.level}!`);
                    const leveledUpStats = this.hero.getEffectiveStats(equippedItems, activeEffects)
                    this.updateSessionStats(leveledUpStats)
                }
            }
            
            this.lastMonsterAttackTimes.set(deadMonster, -1)
        })

        // --- Cleanup Dead Monsters ---
        const aliveMonsters = this.monsters.filter(m => m.isAlive())
        if (aliveMonsters.length < this.monsters.length) {
            this.lastMonsterAttackTimes.forEach((time, monster) => {
                if (time === -1 || !monster.isAlive()) {
                this.lastMonsterAttackTimes.delete(monster)
                }
            })
            this.monsters = aliveMonsters
        }
    }
    
    // Re-sync effective stats at end of frame
    if (this.hero) {
         const finalDetailedStats = this.hero.getEffectiveStats(equippedItems, activeEffects);
         this.updateSessionStats(finalDetailedStats);
    }

    // --- Check for Wave Clear ---
    if (this.monsters.length === 0 && this.isRunning) { // Ensure game is still running
      this.addLogMessage(`Wave ${this.waveNumber} cleared!`);
      // console.log(`Wave ${this.waveNumber} cleared!`);
      this.waveNumber++
      this.spawnWave(this.renderer.getCanvasWidth(), this.renderer.getCanvasHeight())
    }

    // TODO: Check win conditions (timer is handled above, all waves cleared?)
    // console.log('[GameManager] update finished.');
  }

  private gameOver (heroSurvived: boolean) {
    if (!this.isRunning) return // Already stopped or stopping

    this.stop() // Stop the loop

    const reason: GameOverReason = heroSurvived ? 'TimeExpired' : 'HeroDefeated';
    this.setSessionGameState('GameOver', reason) // Use the correct store action

    if (reason === 'HeroDefeated') {
        this.addLogMessage('Game Over: Hero was defeated!')
    } else {
        this.addLogMessage('Game Over: Time ran out!')
    }
    console.log(`Game Over! Reason: ${reason}`) 
  }

  private render () {
     // Log what is being passed to draw
     // console.log('[GameManager] render called. Hero:', this.hero, 'Monsters:', this.monsters);
     this.renderer.clear();
     this.renderer.draw(this.hero, this.monsters);
     // console.log('[GameManager] render finished.');
  }

  start () {
    console.log('[GameManager] Start method called.');
    if (this.isRunning) {
      console.warn('[GameManager] Start called but game is already running.');
      return;
    }
    
    const canvas = this.renderer.getCanvas();
    if (!canvas) {
        console.error('[GameManager] Cannot start: Canvas not available via Renderer.');
        return;
    }

    // Initialize game state FIRST
    try {
      console.log('[GameManager] Initializing game state via start()...');
      this.initializeGameState(canvas.width, canvas.height);
      console.log('[GameManager] Initialization complete via start().');
    } catch (error) {
       console.error('[GameManager] Error during initializeGameState:', error);
       this.stop(); // Stop if init fails (sets isRunning false)
       this.setSessionGameState('NotStarted'); // Ensure state is NotStarted
       return;
    }
    
    // NOW set state to InProgress and start the loop
    console.log('[GameManager] Setting state to InProgress and starting loop...');
    this.isRunning = true;
    this.setSessionGameState('InProgress'); // Set state AFTER init
    this.lastTimestamp = performance.now(); 
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
    console.log('[GameManager] Start method finished.');
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

  // --- New Public Method to Use a Gravy --- 
  useGravy (gravyBaseId: string): boolean {
    const gravyData = BASE_GRAVIES[gravyBaseId];
    if (!gravyData) {
      console.error(`Attempted to use unknown Gravy: ${gravyBaseId}`);
      return false;
    }

    const inventoryState = useInventoryStore.getState();
    const currentItems = inventoryState.items;
    const requiredIngredients = Object.entries(gravyData.recipe) as [string, number][];
    const availableIngredients: Record<string, number> = {};
    currentItems.forEach(item => {
      if (item.type === 'Ingredient') {
        availableIngredients[item.baseId] = (availableIngredients[item.baseId] || 0) + 1;
      }
    });

    const canCraft = requiredIngredients.every(([baseId, quantity]) => 
        (availableIngredients[baseId] || 0) >= quantity
    );

    if (!canCraft) {
      this.addLogMessage('Not enough ingredients!');
      return false;
    }

    // 2. Consume Ingredients
    const itemsToRemove: string[] = [];
    requiredIngredients.forEach(([baseId, quantity]) => {
      let count = 0;
      for (const item of currentItems) {
        if (item.baseId === baseId && count < quantity) {
          itemsToRemove.push(item.id);
          count++;
        }
        if (count === quantity) break;
      }
    });
    itemsToRemove.forEach(id => inventoryState.removeItemById(id));
    this.addLogMessage(`Used ingredients for ${gravyData.name}.`);

    // 3. Apply Effect
    const gravyInstance = createGravyInstance(gravyBaseId); // Reuse function
    if (gravyInstance) {
        const effect = gravyInstance.generateEffect();
        this.addActiveEffect(effect); // Add to store
        this.addLogMessage(`${gravyData.name} effect applied!`);
        // Force stat update to reflect buff immediately
        const currentEffects = useGameSessionStore.getState().activeEffects;
        const equipped = useInventoryStore.getState().equippedItems;
        const newStats = this.hero?.getEffectiveStats(equipped, currentEffects);
        if (newStats) this.updateSessionStats(newStats);
        return true;
    }
    return false; // Should not happen if gravyData existed
  }
}

export { GameManager }