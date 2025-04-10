# User Testing Preparation Plan

This document outlines the steps needed to prepare the "Gravies of the Ancients" prototype for initial user testing, focusing on the core gameplay loop and UI feedback.

## Essential Steps

- [ ] **1. Implement Start/Restart Mechanism:**
    - [ ] Add a "Start Game" button to the main UI.
    - [ ] Prevent the game from starting automatically on page load.
    - [ ] Add state (e.g., in `useGameSessionStore`) to track game state (Not Started, In Progress, Game Over).
    - [ ] Modify UI to show the button only when the game is Not Started.
    - [ ] Connect the button to trigger the `GameManager.start()` method and update game state.
    - [ ] Add a "Play Again" button on the Game Over screen/state.
    - [ ] Connect the "Play Again" button to reset relevant states and start a new game.

- [ ] **2. Implement Basic Game Over Summary:**
    - [ ] Create a new `GameOverDisplay` component (React).
    - [ ] Conditionally render this component (e.g., as an overlay) when game state is Game Over.
    - [ ] Display the final Wave Reached (fetch from `useGameSessionStore`).
    - [ ] Display the reason for game over (Hero Defeated / Time Expired).
    - [ ] Display the list of collected loot (fetch from `useInventoryStore`).
    - [ ] Include the "Play Again" button within this component.

- [ ] **3. Deployment:**
    - [ ] Choose a deployment platform (e.g., Vercel, Netlify).
    - [ ] Set up deployment for the Next.js project.
    - [ ] Generate a shareable URL for testers.

- [ ] **4. Basic Instructions & Context:**
    - [ ] Add a small, static text area on the page explaining the basic goal (survive waves, collect loot) and UI layout.
    - [ ] Prepare separate, clear instructions for testers on *how* to test and *what* feedback is needed.

- [ ] **5. Feedback Mechanism:**
    - [ ] Set up the chosen method for collecting feedback (e.g., Google Form link, Discord channel).

## Recommended Polish

- [ ] **6. Combat Visual Feedback:**
    - [ ] Add a simple visual effect (e.g., brief color flash) in the `Renderer` when an entity takes damage.
    - [ ] (Optional) Render temporary damage numbers near the target entity.

- [ ] **7. Item Stat Tooltips:**
    - [ ] Implement tooltips (e.g., using Radix UI Tooltip primitive via Shadcn) for items in the `Graventory` component.
    - [ ] Display item stats/modifiers within the tooltip.

- [ ] **8. Initial Balancing Pass:**
    - [ ] Review Hero base stats vs. initial Monster stats.
    - [ ] Adjust values in `Hero.ts` and `Monster.ts` constructor/wave scaling to ensure Wave 1 is reasonably challenging but not impossible.

*Let's proceed step-by-step through the Essentials.* 