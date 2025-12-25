# Rivers of Reckoning

A retro-style RPG game built with Python and pygame-ce, featuring **fully procedural world generation** using OpenSimplex noise, ECS architecture, dynamic biomes, and web deployment via pygbag.

## 🎮 Features

- **Infinite Procedural World**: Explore an endless world generated using OpenSimplex noise with natural-looking terrain and biomes
- **Dynamic Biomes**: Marsh, Forest, Desert, Tundra, and Grassland - each with unique characteristics
- **ECS Architecture**: Entity Component System design inspired by modern game engines
- **Weather & Day/Night System**: Dynamic weather changes and time-of-day progression
- **Retro Aesthetics**: 960x960 pixel display with classic 16-color palette
- **Web Deployment**: Play in browser via pygbag on GitHub Pages
- **Cross-Platform**: Desktop (Windows, macOS, Linux) and Web

## 🛠️ Installation

### Prerequisites

- Python 3.10 or higher

### Install Dependencies

```bash
# Using pip
pip install pygame-ce opensimplex esper

# For development (includes testing tools)
pip install -e ".[dev]"

# For web deployment
pip install -e ".[web]"
```

## 🎮 Running the Game

### Desktop

```bash
# Using the CLI
rivers-of-reckoning

# Or using Python
python main.py
```

### Web

The game is automatically deployed to GitHub Pages via pygbag when changes are pushed to main.

To build locally for web:

```bash
pip install pygbag
python -m pygbag --build build/web .
```

## 🌍 Procedural Generation

The game uses advanced procedural generation techniques inspired by modern game engines:

### Noise-Based Terrain

- **OpenSimplex Noise**: Multiple octaves of noise (FBM - Fractal Brownian Motion) for natural terrain
- **Biome Generation**: Temperature and moisture maps determine biome placement
- **Deterministic Seeds**: Each seed generates a unique but reproducible world

### Biome System

| Biome     | Temperature | Moisture | Characteristics |
|-----------|-------------|----------|-----------------|
| Marsh     | Moderate    | High     | Water-heavy, moderate enemies |
| Forest    | Moderate    | Medium   | Dense trees, medium visibility |
| Desert    | High        | Low      | Open terrain, high stamina drain |
| Tundra    | Low         | Any      | Cold, slower movement |
| Grassland | Moderate    | Low      | Open plains, fast travel |

### ECS Architecture

The game uses the `esper` Entity Component System:

- **Components**: Pure data (Position, Velocity, Health, Combat, etc.)
- **Processors**: Game logic systems (Movement, AI, Weather, Time, etc.)
- **Entities**: Composable game objects

## 🎮 Controls

- **Arrow Keys**: Move player through the infinite world
- **ENTER**: Start game from title screen
- **ESC**: Pause / Resume / Quit
- **Q**: Quit to menu (when paused)

### Boss Battles

- **A**: Attack
- **S**: Cast spell
- **ESC**: Flee from battle

## 📁 Project Structure

```
├── src/
│   └── rivers_of_reckoning/
│       ├── __init__.py          # Package initialization
│       ├── cli.py               # CLI entry point
│       ├── engine.py            # Pygame-ce abstraction layer
│       ├── game.py              # Main game class
│       ├── player.py            # Player logic
│       ├── enemy.py             # Enemy logic
│       ├── map.py               # Map system (camera-based viewport)
│       ├── map_data.py          # Game data and constants
│       ├── world_gen.py         # Procedural world generation
│       ├── systems.py           # ECS components and processors
│       ├── boss.py              # Boss encounters
│       ├── shop.py              # Shop system
│       ├── procedural_enemies.py # Procedural enemy generation
│       └── utils.py             # Utility functions
├── main.py                      # Desktop entry point
├── main_web.py                  # Web (pygbag) entry point
├── pyproject.toml               # Project configuration (Hatch)
└── README.md                    # This file
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest test_game_logic.py

# Run with verbose output
pytest -v
```

### Test Coverage

- ✅ Library structure and imports
- ✅ Player movement (infinite world + legacy wrap modes)
- ✅ Procedural map generation with different seeds
- ✅ Biome walkability rules
- ✅ Game state transitions
- ✅ Enemy encounters and events

## 🔧 Development

### Package Installation

```bash
# Install in development mode
pip install -e ".[dev]"

# Build package
python -m build

# Install from source
pip install -e .
```

### Architecture Highlights

- **Infinite World**: Camera-based viewport following the player through procedural terrain
- **Noise Generators**: Instance-based OpenSimplex noise for reproducible worlds
- **Tile Caching**: Efficient caching of generated tiles for performance
- **ECS Design**: Clean separation of data (components) and logic (processors)

## 🌐 Web Deployment

The game deploys to GitHub Pages using pygbag:

1. Push to main branch triggers the web-deployment workflow
2. pygbag compiles Python to WebAssembly
3. Static site is deployed to GitHub Pages

### Render.com Deployment

A `render.yaml` blueprint is provided for Render.com static site hosting.

## 📈 Technical Details

### Technology Stack

- **pygame-ce**: Modern fork of pygame for cross-platform 2D games
- **opensimplex**: Fast noise generation for procedural content
- **esper**: Lightweight Entity Component System
- **pygbag**: Python to WebAssembly compiler for browser deployment
- **Hatch**: Modern Python project management

### Game Engine Features

- **Resolution**: 960x960 pixel display (scaled from 256x256 logical)
- **Color Palette**: 16-color retro aesthetic
- **Performance**: 60 FPS target with async support
- **World Size**: Infinite (procedurally generated on-demand)

### Procedural Generation Techniques

Inspired by advanced game rendering techniques:

- **FBM (Fractal Brownian Motion)**: Layered noise for natural terrain
- **Biome Classification**: Whittaker-style temperature/moisture mapping
- **Deterministic Generation**: Same seed = same world

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **pygame-ce Community**: For maintaining the excellent pygame fork
- **pygbag**: For enabling Python games in the browser
- **Otterfall**: Inspiration for ECS architecture and procedural generation
- **Contributors**: All contributors to the project

---

**Ready to explore an infinite world?** Run: `python main.py`
