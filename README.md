# Rivers of Reckoning

> **An immersive, procedurally generated 3D roguelike RPG built for instant web play**

[![Node.js CI](https://github.com/jbcom/nodejs-rivers-of-reckoning/actions/workflows/nodejs-app.yml/badge.svg)](https://github.com/jbcom/nodejs-rivers-of-reckoning/actions/workflows/nodejs-app.yml)

## 🌊 The Vision

**Rivers of Reckoning** is a browser-based adventure where players explore an infinite, ever-changing world of marshes, forests, deserts, and tundra. Every playthrough is unique—generated from a seed that creates coherent biomes, dynamic weather, and challenging encounters.

### Player Experience Goals

- **Instant Play**: Click and you're in. No downloads, no installs, no waiting.
- **One More Turn**: Addictive exploration loop - "what's over that next hill?"
- **Tactile Feedback**: Responsive controls, satisfying combat, clear visual feedback
- **Mobile-Friendly**: Touch controls that feel native, not bolted-on
- **Shareable Worlds**: Share your seed with friends to explore the same world
- **Persistent Progress**: Local storage saves your best runs and achievements

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **3D Engine** | [@jbcom/strata](https://www.npmjs.com/package/@jbcom/strata) | Procedural terrain, vegetation, weather, audio, AI |
| **3D Rendering** | React Three Fiber + Three.js | WebGL rendering in React |
| **UI Framework** | Material-UI (MUI) | Responsive game UI and menus |
| **State Management** | Zustand | Fast, lightweight game state |
| **Build Tool** | Vite | Fast development and production builds |
| **Testing** | Playwright | End-to-end browser testing |
| **Cross-Platform** | Capacitor | Native mobile deployment (iOS/Android) |

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run end-to-end tests
pnpm test:e2e
```

## 📁 Project Structure

```
src/
├── App.tsx                 # Main game component with 3D scene
├── main.tsx                # React entry point
├── components/
│   ├── TitleScreen.tsx     # Game title and start menu
│   ├── GameHUD.tsx         # In-game HUD (health, stamina, weather)
│   ├── PauseMenu.tsx       # Pause overlay
│   ├── GameOverScreen.tsx  # End game stats and restart
│   ├── Player.tsx          # Player character with WASD movement
│   ├── Enemy.tsx           # Enemy AI and spawning system
│   └── Combat.tsx          # Attack mechanics and damage
├── constants/
│   └── game.ts             # Centralized game configuration
├── events/
│   └── combatEvents.ts     # Decoupled event communication
├── store/
│   └── gameStore.ts        # Zustand state management
└── types/
    └── game.ts             # TypeScript type definitions
```

See [GAME_IDENTITY.md](./GAME_IDENTITY.md) for the complete game vision and design document.

## 🎮 Controls

| Input | Action |
|-------|--------|
| **WASD / Arrow Keys** | Move player |
| **Space / Left Click** | Attack |
| **Mouse Drag** | Rotate camera |
| **Scroll Wheel** | Zoom in/out |
| **ESC** | Pause game |

## 🎮 Game Features

### Procedural World Generation
- **Terrain**: Multi-octave FBM noise creates realistic hills, valleys, and rivers
- **Biomes**: Temperature and moisture maps determine grassland, forest, desert, tundra
- **Vegetation**: Trees, grass, and rocks placed contextually based on biome

### Dynamic Systems
- **Weather**: Clear, rain, fog, snow, storm - affects visibility and gameplay
- **Day/Night Cycle**: Dawn, day, dusk, night with lighting changes
- **Time Progression**: Game time flows, affecting NPC behavior and events

### Combat & Enemies
- **Enemy AI**: Procedurally generated enemies with wandering, chasing, and attacking states
- **Combat System**: Attack with Space or Click, enemies deal damage on contact
- **Progression**: Defeat enemies for XP and gold, level up for increased stats

### Visual Effects
- **Procedural Sky**: Dynamic atmospheric rendering
- **Water**: Animated shader with waves and caustics
- **Post-Processing**: Bloom, vignette, cinematic effects

## 🎯 Development Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm typecheck        # Type-check without emitting

# Build
pnpm build            # Production build
pnpm preview          # Preview production build

# Testing
pnpm test             # Run unit tests (Vitest)
pnpm test:e2e         # Run Playwright e2e tests
pnpm test:e2e:ui      # Run e2e tests with UI
pnpm test:e2e:debug   # Debug e2e tests

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix lint issues
```

## 🌍 Cross-Platform Deployment

### Web (Primary)
```bash
pnpm build
# Deploy dist/ to any static hosting
```

### Mobile (Capacitor)
```bash
pnpm build
npx cap sync
npx cap run android  # or ios
```

## 📊 Game Architecture

### State Management (Zustand)
The game uses a centralized Zustand store for all game state:
- Player position, health, stamina, stats
- Time of day and weather systems
- World state and progression tracking

### Strata Integration
We use [@jbcom/strata](https://www.npmjs.com/package/@jbcom/strata) for:
- `fbm()` - Fractal Brownian Motion for terrain generation
- `createGrassInstances()`, `createTreeInstances()`, `createRockInstances()` - Vegetation
- `ProceduralSky` - Dynamic sky rendering
- `Rain`, `Snow` - Weather particle effects
- `CinematicEffects` - Post-processing

## 🎨 Visual Design

- **Palette**: Natural colors that shift with biome and time of day
- **Style**: Modern 3D with stylized elements
- **Feedback**: Visual indicators for all game events

## 📝 Migration from Python

This project was migrated from a Python/Pygame implementation. The original Python code is archived in `python-archive/` for reference. Key changes:

| Python (Pygame) | TypeScript (Strata) |
|-----------------|---------------------|
| Pygame surfaces | React Three Fiber Canvas |
| esper ECS | Zustand state management |
| opensimplex | Strata's `fbm()` function |
| Sprite animations | Three.js meshes + shaders |
| pygbag (WASM) | Vite + native web |

## 📄 License

MIT License - see LICENSE for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `pnpm test:e2e`
4. Submit a pull request

---

Built with ❤️ using [Strata](https://www.npmjs.com/package/@jbcom/strata), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber), and [Material-UI](https://mui.com/)
