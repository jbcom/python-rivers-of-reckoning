# Rivers of Reckoning [PYTHON STANDALONE]

> **The Waters are Rising. The Reckoning is Near.**

An immersive, procedurally generated survival roguelike RPG built exclusively with **Python and pygame-ce**. While other games explore the serenity of the marsh, this is a journey of **Hostile Escalation**.

## 🌊 Unique Standalone Identity

*   **The Reckoning Meter**: A unique global threat system. As you explore and survive, the world itself becomes more hostile, triggering major "Surge" events that physically reshape your struggle.
*   **Adaptive River Flow**: Water isn't just a tile; it's a force. Procedural currents physically pull your character and enemies, requiring tactical navigation to "surf" or "fight" the flow.
*   **Hostile Biomes**: Explore the **Sinking Mire**, **Choking Woods**, and **Blistering Wastes**—environments designed to actively resist your presence.
*   **Grim Retro Juice**: A high-contrast "Rivers" palette (Sulfur, Poison, Blood) combined with aggressive screen shake and impactful combat feedback.
*   **Pure Python**: Optimized for peak performance via `pygame-ce` and seamless web play via `pygbag` WASM.

## 🎮 Core Gameplay

*   **Tactical Navigation**: Use the river's flow to move faster or avoid enemies, but beware of being pulled into hazards.
*   **Rising Threat**: Monitor the Reckoning Meter. Every step forward increases the world's anger.
*   **Survival Roguelike**: Perma-death challenge where you must balance exploration rewards against the inevitable escalation of the Reckoning.

## 🛠️ Installation

### Prerequisites

- Python 3.10 or higher

### Install Dependencies

```bash
# Using pip
pip install pygame-ce opensimplex esper

# For development
pip install -e ".[dev]"
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

To build locally for web:

```bash
pip install pygbag
python -m pygbag --build .
```

## 🌍 Procedural Systems

*   **FBM Noise Terrain**: Infinite, coherent world generation.
*   **Whittaker Biomes**: Shifting environments based on moisture/temp.
*   **Flow Fields**: Directional water currents derived from moisture noise.
*   **ECS Architecture**: Clean separation of data and logic using `esper`.

## 📁 Project Structure

```
├── main.py                      # THE entry point (async, pygbag-ready)
├── src/rivers_of_reckoning/
│   ├── engine.py                # Responsive pygame with juice & scaling
│   ├── game.py                  # Main loop & Reckoning mechanics
│   ├── world_gen.py             # Procedural biomes & Flow fields
│   ├── systems.py               # ECS components & processors
│   ├── map.py                   # Infinite scrolling camera
│   ├── player.py                # Mechanics & stats
│   ├── enemy.py                 # AI & spawning
│   └── map_data.py              # Branded palette & constants
└── tests/                       # Python test suite
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **pygame-ce Community**: For the high-performance framework.
- **pygbag**: For bringing Python to the web.
- **Otterfall**: Inspiration for procedural ECS design.

---

**"The further you go, the heavier the Reckoning."** Run: `python main.py`
