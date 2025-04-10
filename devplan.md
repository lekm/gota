# Project: Gravies of the Ancients - Browser Auto-Battler

## 1. Overall Goal
Create the foundational structure and core mechanics for a browser-based, humorous auto-battler game with RPG-lite elements called "Gravies of the Ancients". Prioritize simple, robust, reliable, and extensible code using standard web technologies.

## 2. Core Technology Stack
-   **Frontend:** HTML, CSS, JavaScript (ES6+ preferred for modules/classes).
-   **Rendering:** Use the **HTML5 Canvas API** for rendering the main battle screen. Keep rendering logic separate from game logic. Avoid complex external game engines for now to maintain simplicity.
-   **Persistence:** Use **`localStorage`** for saving player progress (unlocked heroes, zones, highest wave achieved, potentially crafted gravies/inventory if simple enough).
-   **Structure:** Emphasize a modular design. Use JavaScript Classes or Modules (e.g., `GameManager`, `Hero`, `Monster`, `CombatSystem`, `LootSystem`, `CraftingSystem`, `UIManager`, `Renderer`). Ensure clear separation of concerns.

## 3. Core Gameplay Loop (Single Session)
1.  **Hero Selection:** Player chooses an available, unlocked Hero (Chef character).
2.  **Battle Start:** The selected Hero is placed in a Zone and automatically begins fighting waves of incoming Monsters.
3.  **Auto-Combat:** The Hero and Monsters automatically attack each other based on their stats (e.g., attack speed, damage, health). Player interaction during combat is minimal (limited to potential future ability activations, but not required for V1).
4.  **Wave Progression:** Monsters appear in waves. Each subsequent wave should be slightly more difficult (e.g., more monsters, stronger monsters, different monster types).
5.  **Loot Drops:** Defeated monsters have a chance to drop:
    *   **Equipment:** Kitchen-themed items (e.g., "Spatula of Slicing", "Colander Helm of Draining", "Whisk of Swiftness"). Affixes should mimic Diablo II style but with culinary puns (e.g., "+5 Zest" (Strength), "+10% Chop Speed" (Attack Speed), "Adds 1-3 Scoville Heat Damage" (Fire Damage), "+15 Vigor" (Vitality)).
    *   **Gravy Ingredients:** Items like "Mystic Roux", "Condensed Umami", "Essence of Savory", "Salt Shard".
6.  **Session End:** The battle session ends when either:
    *   The Hero's health reaches zero.
    *   A **2-minute timer** expires.
7.  **Post-Battle:** Record results (wave reached, loot collected). Return to a main menu/hub screen.

## 4. Key Systems & Features to Implement

### 4.1. Hero System
-   Implement a `Hero` class with base stats: Health, Damage, Attack Speed, Defense.
-   Start with **one** playable Chef Hero ("Chef Antoine"). We will add unlocks later.
-   Heroes should have a visual representation on the Canvas (can be a simple shape/placeholder initially).
-   Track Hero level (gains XP based on waves cleared/monsters defeated). Leveling up could slightly increase base stats.

### 4.2. Monster System
-   Implement a `Monster` class with base stats: Health, Damage, Attack Speed.
-   Create 2-3 basic monster types with silly food-related names (e.g., "Angry Asparagus", "Rampaging Radish", "Possessed Potato").
-   Implement a wave generation system that spawns monsters and increases their stats or numbers over time/waves.
-   Monsters should have a visual representation on the Canvas.

### 4.3. Combat System
-   Simple turn-based or real-time (based on attack speed) combat logic.
-   `Hero` attacks nearest `Monster`. `Monsters` attack `Hero`.
-   Calculate damage based on attacker's Damage and defender's Defense (if implemented, or just direct damage initially).
-   Update health bars/visual indicators.

### 4.4. Item & Loot System
-   Implement an `Item` base class, with `Equipment` and `Ingredient` subclasses.
-   `Equipment` should have slots (e.g., Weapon, Helm, Body, Accessory) and stats/affixes. Define a simple structure for affix generation (e.g., prefix + base item name + suffix).
-   Implement loot tables for monsters (defining drop chances for equipment and ingredients).
-   Basic Inventory display (can be a simple list outside the Canvas initially). Player should be able to equip items between battle sessions.

### 4.5. Gravy Crafting System (Basic Stub)
-   Implement an `Ingredient` class/data structure.
-   Implement a `Gravy` class/data structure. Gravies should have:
    *   A recipe (list of required Ingredients).
    *   An effect (e.g., "+20% Damage for 30 seconds", "+50 Health Regen per second for 15 seconds").
    *   A duration for the buff.
-   Create a basic Crafting UI stub (can be non-functional initially) where players *will* combine ingredients.
-   Allow players to activate *one* crafted Gravy buff per battle session (details TBD, maybe a button).

### 4.6. Progression System
-   Track Player Level (distinct from Hero level, perhaps based on total waves cleared across all runs).
-   **Unlocks (Placeholders for now):** Define where unlocks *will* happen, but don't implement the full logic yet:
    *   **Heroes:** The 2nd and 3rd heroes will be unlocked at specific Player Levels (e.g., Level 5, Level 10).
    *   **Zones:** Start with **one** Zone ("The Pungent Pantry"). Define 5 other food-themed zone names (e.g., "The Sizzling Skillet Steppes", "Fridge Fjord", "Cupboard Catacombs", "The Gelatinous Jungle", "Mount Casserole"). These will be unlocked by Player Level. Each zone might later influence monster types or environmental effects.

### 4.7. UI & Rendering
-   **HTML Structure:** Basic HTML file (`index.html`) to host the canvas and surrounding UI elements (Hero Select, Inventory, Crafting stubs, Stats display).
-   **CSS:** Simple CSS (`style.css`) for layout and basic styling.
-   **Canvas Rendering:**
    *   Clear the canvas each frame.
    *   Draw the background (simple color/gradient for the zone).
    *   Draw the Hero sprite/shape.
    *   Draw Monster sprites/shapes.
    *   Draw Health Bars above characters.
    *   Display the Wave number and Timer.
    *   Display basic Hero stats (HP).
    *   (Optional) Draw simple attack animations (e.g., flashes, projectiles).

## 5. Initial Steps & Focus
1.  Set up the basic HTML, CSS, and JavaScript file structure.
2.  Initialize the Canvas and create a basic `Renderer` class/module.
3.  Implement the main `GameManager` class with a simple game loop (`requestAnimationFrame`).
4.  Implement basic `Hero` and `Monster` classes with stats.
5.  Render the Hero and one Monster on the Canvas.
6.  Implement the basic auto-attack combat logic.
7.  Add health bars and track health changes.
8.  Implement the 2-minute timer and Hero death condition to end the game loop.

## 6. Guidance for Cursor
-   Generate code incrementally, focusing on one system at a time based on the steps above.
-   Write clean, well-commented JavaScript code.
-   Explain the choices made regarding structure and implementation.
-   Use ES6 Classes or Modules for organization.
-   Keep functions focused on a single responsibility.
-   Ask clarifying questions if any part of the request is ambiguous.
-   Ensure the foundation is extensible for future features (more heroes, items, zones, complex mechanics).

Let's start building the foundation for "Gravies of the Ancients"! Begin with step 1: Setting up the project structure and the basic HTML/CSS/JS files, including the Canvas element.