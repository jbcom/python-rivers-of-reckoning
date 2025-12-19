# CLAUDE.md - Rivers of Reckoning

> **A fully procedural roguelike RPG designed for web-first gameplay via pygbag**

## 🎮 Game Mission

Rivers of Reckoning is a **web-first, procedurally generated RPG** built with pygame-ce and deployed via pygbag to GitHub Pages. Every aspect of the game—terrain, biomes, enemies, weather—is generated using noise functions for infinite replayability.

### Core Design Principles

1. **Web-First**: The game is designed primarily for browser play. All code must be pygbag-compatible.
2. **Responsive Scaling**: Uses `pygame.SCALED | pygame.RESIZABLE` to auto-adapt to any screen size.
3. **Procedural Everything**: No hardcoded maps or content. Everything is generated from noise and seeds.
4. **Retro Aesthetic**: 256x256 logical resolution with a 16-color palette, scaled to fill the viewport.
5. **ECS Architecture**: Clean separation of data (components) and logic (systems) using esper.

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Engine | pygame-ce | Cross-platform 2D graphics |
| Web Deploy | pygbag | Python → WebAssembly compilation |
| World Gen | opensimplex | Noise-based procedural terrain |
| Architecture | esper | Entity Component System |

## Development Commands

```bash
# Run the game (works locally and compiles for web)
python main.py

# Run tests
pytest -v

# Lint code
flake8 src/first_python_rpg/

# Build for web
python -m pygbag --build .

# Update dependencies
uv lock && uv sync
```

## Project Structure

```
main.py                    # Single entry point (pygbag-compatible async)
src/first_python_rpg/
├── engine.py              # Responsive pygame wrapper with auto-scaling
├── game.py                # Main game class and state machine
├── world_gen.py           # Procedural world generation (OpenSimplex)
├── systems.py             # ECS components and processors
├── map.py                 # Infinite map with camera viewport
├── player.py              # Player entity and mechanics
├── enemy.py               # Enemy entities
└── map_data.py            # Game constants and data
```

## Key Architecture Decisions

### Single Entry Point
There is ONE `main.py` file. No separate desktop/web versions. The game is inherently web-first and uses async patterns compatible with pygbag.

### Responsive Engine
The `Engine` class uses `pygame.SCALED | pygame.RESIZABLE` flags. The game renders at 256x256 logical pixels and automatically scales to fill any viewport while maintaining aspect ratio.

### Infinite Procedural World
The `ProceduralWorld` class generates terrain on-demand using OpenSimplex noise. Each seed produces a unique but reproducible world. The camera follows the player through infinite terrain.

### ECS Pattern
Game logic is separated into:
- **Components**: Pure data (Position, Health, Combat, etc.)
- **Processors**: Systems that operate on components (Movement, AI, Weather)

## Coding Standards

- **Python 3.10+** required
- **No blocking calls** - everything must be async-compatible for pygbag
- **No desktop-specific code** - web-first means no file system access, no subprocess, etc.
- **Conventional commits** - feat/fix/docs/test/chore prefixes

## Before Making Changes

1. Read `memory-bank/activeContext.md` if it exists
2. Run tests: `pytest -v`
3. Check lint: `flake8 src/`
4. Understand the web-first constraint

## After Making Changes

1. Ensure all tests pass
2. Ensure lint passes
3. Test that the game runs: `python main.py`
4. Update documentation if needed
