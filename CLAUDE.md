# CLAUDE.md - Rivers of Reckoning [PYTHON STANDALONE]

> **"A hero's legacy is written in the steps they take against the Reckoning."**

## 🌊 The Standalone Vision: The Legend of Rivers

**Rivers of Reckoning** is a personal tribute turned into an atmospheric roguelike. While the TypeScript "Rivermarsh" focuses on literal geography, this Python standalone is the **Saga of Rivers**—a character-driven journey through a world that actively reacts to your progress.

## 📜 The Genesis: From Curses to 2.5D

**Rivers of Reckoning** evolved from a `curses` terminal project into this 2.5D Python saga. While TypeScript versions move into 3D space, this project remains committed to the **2.5D Perspective**—preserving the readability and logic-first approach of its origins.

### How we differ from "Rivermarsh" (TS):
1.  **The Protagonist's Burden**: The game is about the character "Rivers" and his struggle against the **Reckoning**.
2.  **2.5D Spatial Logic**: We use grid-based depth rather than full 3D geometry. This keeps the code accessible for those learning game logic.
3.  **The Reckoning Meter**: A unique "destiny" mechanic.
4.  **Fate's Pull**: Physical force representing the world's attempt to steer Rivers off his path.
5.  **Legendary Aesthetic**: High-contrast, moody colors.

### Unique Standalone Goals

1.  **Character Growth**: Focus on the leveling and gear progression of Rivers.
2.  **Destiny Events**: The Reckoning triggers "Trials" (surges) that test the player's resolve.
3.  **Personalized UI**: A "Chronicle" style HUD that tracks the legend of the current run.
4.  **Juice & Feedback**: Aggressive screen shake and tactical "impact" frames to make every victory feel hard-earned.

## 🛠 Technology Stack (Python Solely)

```
pygame-ce     → The heart of the engine
pygbag        → Bringing the legend to the web (WASM)
opensimplex   → Procedural fate-generation
esper         → ECS for managing the world's entities
```
