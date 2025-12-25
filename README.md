# Rivers of Reckoning [PYTHON STANDALONE]

> **The World Awakens. The Reckoning Begins.**

**Rivers of Reckoning** is an atmospheric survival roguelike RPG built exclusively with **Python and pygame-ce**. Originally created to inspire a love for programming in its namesake, Rivers, this game is a standalone **Hero's Saga** that focuses on the physical struggle against a world that actively fights your progress.

## 🌊 The Legend of Rivers

Unlike other titles that explore literal geography, this game is the story of a character named **Rivers** and his journey through an infinite, procedurally generated world. As Rivers explores, he must manage the **Reckoning**—a global threat meter that represents the world's increasing resistance to his journey.

## 📜 The Genesis of Rivers

**Rivers of Reckoning** began as a simple `curses`-based terminal interface, created by a father to teach his stepson, **Rivers**, the fundamentals of programming. Its evolution from a text-based grid to a 2.5D graphical saga mirrors the learning journey itself.

*   **Era 1: Curses (Terminal)**: Pure logic, character-based movement, and ASCII "rivers".
*   **Era 2: Python 2.5D (Current)**: The "Goldilocks" zone of game dev—combining the readability of Python with the spatial depth of a 2.5D perspective. Unlike 3D engines that focus on geometry, this version focuses on **the grid, the logic, and the flow**.
*   **Era 3: OSS Standalone**: Now an open-source tribute, maintaining its 2.5D identity to stand apart from 3D clones, preserving the "approachable" feel of its Python roots.

### ⚔️ Unique Standalone Features

*   **The Hero's Burden (Reckoning Meter)**: Your presence in the world is not ignored. As you survive and grow, the world strikes back with **Reckoning Surges**—violent events that test your health and resolve.
*   **The Flow of Fate**: The world is filled with physical currents that push and pull you. Mastery of the **Flow** is essential for tactical movement and survival.
*   **Legacy Biomes**: Explore the **Forsaken Path**, **Iron Woods**, and **Blistering Wastes**—each procedurally generated backdrops for your legendary run.
*   **Branded 16-Color Palette**: A unique, high-contrast visual style (Deep Void, Sulfur, Poison, Blood) designed for atmospheric impact.
*   **Juicy Tactical Feedback**: Every action has weight. Aggressive screen shake, impact frames, and animated UI elements create a high-quality "retro-plus" experience.

## 🎮 Core Gameplay

*   **Fight the Flow**: Use the physical currents of the world to your advantage, or find yourself swept into lethal encounters.
*   **Outrun the Reckoning**: The longer you survive, the harder the world fights. There is no standing still in the Saga of Rivers.
*   **Perma-death Survival**: Every run is a unique legend. How far will your legacy reach?

## 🛠️ Installation & Play

### Prerequisites
- Python 3.10 or higher

### Desktop Play
```bash
# Using the CLI
rivers-of-reckoning

# Or using Python directly
python main.py
```

### Web Play
Build the legend for the browser using `pygbag`:
```bash
pip install pygbag
python -m pygbag --build .
```

## 🌍 Procedural Saga Systems

*   **FBM Noise Destiny**: Infinite, coherent world generation.
*   **Whittaker Trials**: Shifting biomes based on environmental moisture and temperature.
*   **Fate Fields**: Directional physical currents derived from procedural moisture noise.
*   **ECS Chronicle**: Clean, modular code design using the `esper` Entity Component System.

---

**"Your legacy is defined by the depth of your Reckoning."** Run: `python main.py`
