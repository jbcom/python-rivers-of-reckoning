# 📖 The Game Bible: Rivers of Reckoning (The Saga)

## 🌊 Core Vision: The Saga of Rivers
**Rivers of Reckoning** is a character-driven, **Classic 2.5D RPG**. It follows the legend of **Rivers**, a hero on a quest through a perilous world. Unlike generic roguelikes, this is a **Saga**—focused on progression, discovery, and the mastery of the world's physical forces. It honors its origins as a logic-teaching tool by maintaining a clean, grid-based logic while delivering a high-impact visual experience.

---

## 🎭 The Core Message: "The Hero's Quest"
The game is about overcoming obstacles through logic and skill. The world is a series of trials where the environment itself (The Flow) and the rising danger (The Destiny) test the hero's resolve. The goal is to survive the journey and complete the saga, not just delay an inevitable death.

---

## 🎨 Branding & Aesthetic
### "High-Contrast Saga" Style
- **Perspective**: **2.5D Grid**. Precise, logic-first movement with visual depth via Y-sorting and height-based shadows.
- **Visuals**: A blend of pixel art and atmospheric primitive shapes.
- **Palette**: Branded 16-color "Rivers" palette.
    - **Deep Void (0)**: The unknown and shadows.
    - **Reckoning Red (8)**: Rivers (hero) and danger.
    - **Sulfur (10)**: Magical light and artifacts.
    - **Poison Ivy (11)**: Hostile nature.
- **Juice**: Screen shake, text pulses, and "impact" frames for every heroic action.

---

## ⚔️ Gameplay Mechanics
### 1. The Saga Progression
- **Level-Based World**: The world is divided into distinct regions (The Forsaken Path, The Iron Woods, etc.), each with its own "Boss Trial."
- **Persistent Growth**: Rivers gains permanent strength, gear, and spells that persist throughout the saga.
- **Victory Condition**: Reaching the end of the saga, rather than just "high score" distance.

### 2. The Flow of Fate
- A physical movement mechanic where "Fate" (water/currents) physically pushes objects.
- **Tactical Navigation**: Rivers must use the currents to solve movement puzzles and gain the upper hand in combat.

### 3. The Destiny Meter
- A local region threat level. As Rivers spends time in a region, the "Destiny" of that place awakens, increasing enemy strength and environmental hostility.
- **Trial Surges**: Staying too long triggers a world-shaking event that forces Rivers to move forward.

---

## 🌍 The World: The Regions of Reckoning
The saga takes place across a handcrafted procedural world.

| Region | Essence | Hazard |
|-------|---------|--------|
| **The Forsaken Path** | The beginning of the legend. | Heavy Flow currents. |
| **The Iron Woods** | Dense, claustrophobic trials. | Hidden traps and thick foliage. |
| **The Frozen Veil** | A test of endurance. | Slippery ice flow. |
| **Blistering Wastes** | The peak of the struggle. | High heat and open vulnerability. |

---

## 🕹️ Player Experience & UX
### "Tactile Heroism"
- **Grid Mastery**: Every move is deliberate. The player should feel they are "programming" their way through the world's hazards.
- **Impactful Combat**: Not just stat-checking, but managing positioning relative to Flow and Destiny.
- **Clarity First**: The HUD clearly shows the hero's status (**RIVERS**) and the region's state (**DESTINY**).

---

## 🛠 Technical Manifesto
- **Foundation**: Pure Python 3.10+, `pygame-ce`.
- **Resolution**: **960x960 logical pixels**, high-definition Pygame roots auto-scaled for any viewport.
- **Visuals**: Full character animations (`idle`, `run`, `attack`, `swim`) and rich tile textures.
- **Logic**: Simplified grid-based logic inspired by the original `curses` version.
- **Deployment**: Optimized for `pygbag` web play.
- **Architecture**: Modular and readable, serving as a beacon for aspiring programmers.

---

**"A legend is not just survived; it is completed."**
