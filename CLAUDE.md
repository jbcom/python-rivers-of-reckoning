# CLAUDE.md - Rivers of Reckoning [PYTHON STANDALONE]

> **"The further you explore, the heavier the Reckoning."**

## 🌊 The Standalone Vision: Hostile Escalation

**Rivers of Reckoning** is NOT just a marsh exploration game. It is an **atmospheric survival roguelike** where the world itself is a living antagonist. While other games focus on the serenity of nature, this game focuses on the **Hostility of the Flow** and the **Inevitability of the Reckoning**.

### How we differ from "Rivermarsh" (TS):
1.  **Hostile Environment**: The water doesn't just sit there; it **pulls** you. River Flow is a tactical obstacle.
2.  **The Reckoning Meter**: A unique mechanic where your very existence in the world increases its hostility. There is no safe "grinding"—only moving forward against a rising tide of danger.
3.  **Grim Aesthetic**: A "Corrupted Nature" style using a custom high-contrast palette (Sulfur, Poison Ivy, Blood Marsh).
4.  **Tactile Survival**: Focus on the physical struggle of movement against currents and the management of "Reckoning" events.

### Unique Standalone Goals

1.  **The Reckoning**: A threat system that triggers environmental "judgments" (surges, swarms).
2.  **Adaptive Flow**: Procedural currents that require the player to "surf" or "fight" the river.
3.  **Hostile Biomes**: Renamed and redesigned to feel like places that want you gone (Sinking Mire, Choking Woods).
4.  **Retro Juice**: High-feedback combat with screen shake and "impact" frames.

### The World

- **Biomes** flow naturally into each other based on temperature and moisture
- **Weather** changes dynamically - rain slows you, storms are dangerous
- **Day/Night** cycle affects visibility and enemy behavior
- **River Flow** physically moves objects and characters in water tiles
- **The Reckoning** increases world danger based on time and distance

## 🛠 Technology Stack (Python Solely)

```
pygame-ce     → Modern 2D engine (the core)
pygbag        → Python → WebAssembly compiler
opensimplex   → Procedural world generation noise
esper         → Lightweight ECS for clean logic
```

## 📁 Project Structure

```
main.py                      # THE entry point (async, pygbag-ready)
src/rivers_of_reckoning/
├── engine.py                # Responsive pygame with auto-scaling & juice
├── game.py                  # Game states, update/draw loops, Reckoning
├── world_gen.py             # Procedural biomes & Adaptive Flow
├── systems.py               # ECS components & processors
├── map.py                   # Infinite scrolling camera
├── player.py                # Player mechanics & stats
├── enemy.py                 # Enemy AI and spawning
└── map_data.py              # Branded palette, items, events
```

## 🎯 Development Commands

```bash
# Play the game
python main.py

# Run tests
pytest -v

# Lint
flake8 src/

# Build for web deployment
python -m pygbag --build .

# Update dependencies
pip install -e .
```

## ⚡ Key Technical Decisions

### Python Only
No TypeScript, no Node.js, no JavaScript. This is a dedicated Python experience.

### Responsive Juice
Renders at 256x256 logical pixels with `pygame.SCALED`. Includes screen shake, animated HUD bars, and pulse effects for a high-quality feel.

### The Reckoning Mechanic
Game state includes a rising `reckoning_level` that scales enemy strength and environmental hazards, creating unique tension.

### Adaptive Water Flow
Water tiles are walkable but procedural noise defines a "flow" direction that pushes the player, integrated into the movement system.

## 🎨 Visual Identity

- **Palette**: Branded 16-color "Rivers" aesthetic
- **Resolution**: 256x256 logical, auto-scales to any display
- **Style**: Juicy pixel art with particle-based animations
- **Feedback**: Dynamic screen shake, color flashes, pulse UI

## Before Making Changes

1. Ask: "Does this enhance the standalone Python experience?"
2. Run tests: `pytest -v`
3. Ensure no JS/TS dependencies are introduced
4. Test in browser if possible

## Coding Standards

- Python 3.10+
- No blocking/synchronous patterns (pygbag compatible)
- No Node.js artifacts
- Conventional commits (feat/fix/docs/test/chore)
