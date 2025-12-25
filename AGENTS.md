# AGENTS.md - Rivers of Reckoning

> **Instructions for AI agents working on this web-first procedural RPG**

## 🌊 Game Identity

**Rivers of Reckoning** is a browser-based roguelike RPG where players explore infinite procedurally generated worlds. The game is designed for **instant web play**—click a link and you're adventuring.

### Mission Statement

*Create an immersive, endlessly replayable adventure that runs perfectly in any web browser, with no downloads, no installs, and no waiting.*

### Core Experience

- **Exploration**: Discover biomes, secrets, and challenges in an infinite world
- **Survival**: Manage health, avoid hazards, defeat enemies
- **Progression**: Grow stronger, unlock abilities, achieve high scores
- **Sharing**: Share world seeds with friends for the same adventure

## 🎯 Design Principles

| Principle | What It Means |
|-----------|---------------|
| **Web-First** | Browser is the primary platform. No desktop-only features. |
| **Instant Play** | Game loads fast and starts immediately. No setup required. |
| **Responsive** | Scales perfectly from phone to 4K monitor. |
| **Procedural** | Everything generated from seeds. Infinite variety. |
| **Juicy** | Satisfying feedback for every action. |
| **Accessible** | Simple to learn, clear UI, inclusive design. |

## 🛠 Technology

| Layer | Tech | Why |
|-------|------|-----|
| Engine | pygame-ce | Modern pygame fork, great for 2D |
| Web | pygbag | Compiles Python to WebAssembly |
| World Gen | opensimplex | Coherent noise for natural terrain |
| Architecture | esper | Clean ECS pattern |

## 📁 Structure

```
main.py                      # Single async entry point
src/first_python_rpg/
├── engine.py                # Responsive auto-scaling engine
├── game.py                  # Game loop and state machine
├── world_gen.py             # Procedural generation
├── systems.py               # ECS components/processors
├── map.py                   # Infinite camera-based map
├── player.py                # Player entity
├── enemy.py                 # Enemy AI
└── map_data.py              # Game data/constants
```

## 🔧 Commands

```bash
python main.py          # Run the game
pytest -v               # Run tests
flake8 src/             # Lint code
python -m pygbag .      # Build for web
uv lock && uv sync      # Update dependencies
```

## ✅ Agent Checklist

Before making changes:
- [ ] Understand the web-first constraint
- [ ] Read recent commits for patterns
- [ ] Run tests to confirm clean state

When making changes:
- [ ] Keep code async-compatible (no blocking)
- [ ] Test that `python main.py` runs
- [ ] Ensure all tests pass
- [ ] Follow conventional commits

After changes:
- [ ] Lint passes
- [ ] Tests pass
- [ ] Documentation updated if needed

## ❌ What NOT to Do

- **Don't** add desktop-only features (file dialogs, subprocess, etc.)
- **Don't** use synchronous/blocking patterns
- **Don't** create multiple entry points (there is ONE `main.py`)
- **Don't** hardcode content (everything should be procedural)
- **Don't** break the responsive scaling

## 🎨 Visual Style

- **Resolution**: 256x256 logical, auto-scaled
- **Palette**: 16 retro colors
- **Style**: Clear pixel art, readable at any size
- **Feedback**: Visual confirmation for all actions

## 📝 Commit Format

```
feat(world): add desert biome generation
fix(combat): correct damage calculation
docs: update README with new controls
test: add procedural map variety tests
chore: update dependencies
```

## 🔗 Key Files

| File | Purpose |
|------|---------|
| `main.py` | The only entry point |
| `engine.py` | Pygame wrapper with scaling |
| `world_gen.py` | Procedural world generation |
| `game.py` | Main game class |

## Agent-Specific Notes

### Claude
- Focus on architecture and complex refactoring
- Can make cross-file changes
- Check CLAUDE.md for detailed guidance

### Copilot
- Good for targeted fixes and feature additions
- Check .github/copilot-instructions.md

### Cursor
- IDE-integrated development
- Check .cursor/rules/*.mdc for context
