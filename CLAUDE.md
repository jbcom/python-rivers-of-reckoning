# CLAUDE.md - Rivers of Reckoning

> **An immersive, procedurally generated roguelike RPG built for instant web play**

## 🌊 The Vision

**Rivers of Reckoning** is a browser-based adventure where players explore an infinite, ever-changing world of marshes, forests, deserts, and tundra. Every playthrough is unique—generated from a seed that creates coherent biomes, dynamic weather, and challenging encounters.

### Player Experience Goals

1. **Instant Play**: Click and you're in. No downloads, no installs, no waiting.
2. **One More Turn**: Addictive exploration loop - "what's over that next hill?"
3. **Tactile Feedback**: Responsive controls, satisfying combat, clear visual feedback
4. **Mobile-Friendly**: Touch controls that feel native, not bolted-on
5. **Shareable Worlds**: Share your seed with friends to explore the same world
6. **Persistent Progress**: Local storage saves your best runs and achievements

### The World

- **Biomes** flow naturally into each other based on temperature and moisture
- **Weather** changes dynamically - rain slows you, storms are dangerous
- **Day/Night** cycle affects visibility and enemy behavior
- **Secrets** hidden in the procedural generation reward exploration

## 🎮 Core Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Web-First** | Single async `main.py`, pygbag deployment, no desktop-only features |
| **Responsive** | `pygame.SCALED` auto-fits any screen, touch-friendly UI |
| **Procedural** | OpenSimplex noise generates infinite coherent worlds |
| **Juicy** | Visual feedback, screen shake, particle effects, sound |
| **Accessible** | Clear UI, colorblind-friendly palette, simple controls |

## 🛠 Technology Stack

```
pygame-ce     → Cross-platform 2D engine (web via pygbag)
pygbag        → Python → WebAssembly for browser play
opensimplex   → Coherent noise for world generation
esper         → ECS architecture for clean game logic
```

## 📁 Project Structure

```
main.py                      # THE entry point (async, pygbag-ready)
src/rivers_of_reckoning/
├── engine.py                # Responsive pygame with auto-scaling
├── game.py                  # Game states, update/draw loops
├── world_gen.py             # Procedural biomes via noise
├── systems.py               # ECS components & processors
├── map.py                   # Infinite scrolling camera
├── player.py                # Player mechanics
├── enemy.py                 # Enemy AI and spawning
└── map_data.py              # Constants, items, events
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

# Update lockfile
uv lock && uv sync
```

## ⚡ Key Technical Decisions

### One Entry Point
`main.py` is the ONLY entry point. No `main_web.py`, no `main_desktop.py`. The game is web-first, and the same code runs everywhere.

### Responsive Scaling
```python
pygame.display.set_mode((256, 256), pygame.SCALED | pygame.RESIZABLE)
```
The game renders at 256x256 logical pixels and automatically scales to fill the browser viewport while maintaining aspect ratio.

### Async Everything
All game loops use `async/await` for pygbag compatibility:
```python
async def main():
    game = Game()
    await game.engine.run(game.update, game.draw)
```

### Infinite World
The camera follows the player through procedurally generated terrain. No fixed map boundaries—explore forever in any direction.

## 🎨 Visual Identity

- **Palette**: 16-color retro aesthetic (PICO-8 inspired)
- **Resolution**: 256x256 logical, scales to any display
- **Style**: Pixel art, clear silhouettes, readable at any size
- **Feedback**: Color flashes on damage, smooth transitions

## 🔊 Audio (Planned)

- Procedural ambient sounds based on biome
- Weather audio (rain, wind, thunder)
- Satisfying combat sounds
- Subtle music that responds to danger level

## 📱 Controls

**Keyboard**: Arrow keys move, Space/Enter select, Escape pause
**Touch** (planned): Virtual d-pad, tap-to-interact

## Before Making Changes

1. Ask: "Does this enhance the web play experience?"
2. Run tests: `pytest -v`
3. Check lint: `flake8 src/`
4. Test in browser if possible

## Coding Standards

- Python 3.10+
- No blocking/synchronous patterns
- No file system writes (use localStorage via pygbag)
- No subprocess or OS-specific code
- Conventional commits (feat/fix/docs/test/chore)
