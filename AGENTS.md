# AGENTS.md - Rivers of Reckoning [PYTHON STANDALONE]

> **Instructions for AI agents working on this hostile survival procedural RPG**

## 🌊 The Core Message: "The Toll of the Journey"

Unlike traditional RPGs or the serene exploration of "Rivermarsh", **Rivers of Reckoning** is about **hostile escalation**. Every action and every step forward increases the **Reckoning**—the world's active resistance to your presence.

### Standalone Identity
- **Active Water**: Water tiles have **Flow** (procedural currents) that physically push the player.
- **The Reckoning**: A global danger meter that triggers events and scales enemy lethality.
- **Corrupted Biomes**: Environments are dangerous by design (Sinking Mire, Choking Woods, Blistering Wastes).
- **Tactical Movement**: Navigation is a puzzle of managing current directions and rising threat.

## 🎯 Design Principles

| Principle | What It Means |
|-----------|---------------|
| **Hostile Flow** | Water is a physical force, not just a tile type. |
| **Rising Tension** | The "Reckoning Meter" ensures there is no standing still. |
| **Branded Grim** | Use the "Rivers" palette: dark voids, sulfur yellows, toxic greens. |
| **Pure Python** | No Node.js artifacts. Lightweight, high-performance logic. |

## 🛠 Technology

| Layer | Tech | Why |
|-------|------|-----|
| Engine | pygame-ce | Modern pygame fork, high performance 2D |
| Web | pygbag | Best-in-class Python-to-WASM compilation |
| Noise | opensimplex | Consistent noise for infinite procedural worlds |
| ECS | esper | Clean data/logic separation for RPGs |

## 📁 Structure

```
main.py                      # Single async entry point
src/rivers_of_reckoning/
├── engine.py                # "Juicy" engine with shake and scaling
├── game.py                  # Main loop with Reckoning meter logic
├── world_gen.py             # Procedural world with Flow fields
├── systems.py               # ECS components/processors
├── map.py                   # Infinite camera-based map
├── player.py                # Player stats and leveling
├── enemy.py                 # Enemy AI
└── map_data.py              # Themed constants and palette
```

## 🔧 Commands

```bash
python main.py          # Play test
pytest -v               # Run test suite
flake8 src/             # Lint check
python -m pygbag --build . # Build for web
```

## ✅ Agent Checklist

Before making changes:
- [ ] Verify you are adding Python code ONLY
- [ ] Understand the "Reckoning" and "Flow" unique mechanics
- [ ] Ensure any new UI has "juice" (shake, pulse, or animation)

When making changes:
- [ ] Keep the 16-color branded palette intact
- [ ] Ensure all loops are `async/await` compatible
- [ ] Follow conventional commit standards

## ❌ What NOT to Do

- **Don't** add any `npm`, `pnpm`, or Node.js dependencies
- **Don't** use synchronous/blocking `time.sleep()` calls
- **Don't** break the responsive `pygame.SCALED` system
- **Don't** use generic retro styles; use the unique "Rivers" branding

## 🎨 Visual Style

- **Palette**: Branded 16-color "Rivers of Reckoning" palette
- **Resolution**: 256x256 logical, auto-scaled
- **Vibe**: Atmospheric, moody, marshland-focused
- **Juice**: Visual confirmation for all actions via screen shake or color pulse

## 📝 Commit Format

```
feat(reckoning): increase threat based on river distance
fix(flow): correct water current direction logic
docs: update standalone branding guide
test: add test for procedural flow generation
chore: update pygame-ce dependency
```
