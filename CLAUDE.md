# CLAUDE.md - Rivers of Reckoning

> **An immersive, procedurally generated 3D roguelike RPG built for instant web play**

## 🌊 The Vision

**Rivers of Reckoning** is a browser-based adventure where players explore an infinite, ever-changing world of marshes, forests, deserts, and tundra. Every playthrough is unique—generated from a seed that creates coherent biomes, dynamic weather, and challenging encounters.

### Player Experience Goals

1. **Instant Play**: Click and you're in. No downloads, no installs, no waiting.
2. **One More Turn**: Addictive exploration loop - "what's over that next hill?"
3. **Tactile Feedback**: Responsive controls, satisfying combat, clear visual feedback
4. **Mobile-Friendly**: Touch controls via Capacitor for native mobile apps
5. **Shareable Worlds**: Share your seed with friends to explore the same world
6. **Persistent Progress**: Local storage saves your best runs and achievements

## 🛠 Technology Stack

```
@jbcom/strata       → 3D terrain, vegetation, weather, audio, AI
@react-three/fiber  → React renderer for Three.js
@mui/material       → UI components and theming
zustand             → Lightweight state management
vite                → Fast build and dev server
playwright          → End-to-end testing
capacitor           → Native mobile deployment
```

## 📁 Project Structure

```
src/
├── App.tsx                 # Main 3D scene with Strata components
├── main.tsx                # React entry point
├── components/
│   ├── TitleScreen.tsx     # Start menu
│   ├── GameHUD.tsx         # In-game UI overlay
│   ├── PauseMenu.tsx       # Pause screen
│   └── GameOverScreen.tsx  # End game stats
├── store/
│   └── gameStore.ts        # Zustand game state
└── types/
    └── game.ts             # TypeScript definitions
```

## 🎯 Development Commands

```bash
pnpm dev            # Start dev server
pnpm build          # Production build
pnpm test:e2e       # Run Playwright tests
pnpm lint           # ESLint check
pnpm typecheck      # TypeScript check
```

## ⚡ Key Technical Decisions

### Strata for 3D Game Development
We use [@jbcom/strata](https://www.npmjs.com/package/@jbcom/strata) for all procedural generation:

```typescript
import { fbm, createGrassInstances, createTreeInstances, ProceduralSky, Rain } from '@jbcom/strata'

// Terrain generation with multi-octave noise
const height = fbm(x * 0.02, z * 0.02, 6, 2.2, seed)

// Instanced vegetation
const grass = createGrassInstances(5000, areaSize, biomes, { heightFunction, seed })
```

### Zustand State Management
All game state flows through a single Zustand store:

```typescript
const { gameState, playerHealth, timeOfDay, weather } = useGameStore()
```

### React Three Fiber Game Loop
Game updates use `useFrame` for frame-synchronized updates:

```typescript
function GameLoop() {
  useFrame((_, deltaTime) => {
    updateTime(deltaTime)
    updateWeather(deltaTime)
  })
  return null
}
```

## 🎨 Visual Identity

- **3D Rendering**: Three.js via React Three Fiber
- **Procedural Sky**: Dynamic day/night with weather effects
- **Post-Processing**: Bloom, vignette, cinematic color grading
- **UI**: Material-UI with dark theme and retro typography

## Before Making Changes

1. Check: "Does this enhance the web play experience?"
2. Run: `pnpm typecheck && pnpm lint`
3. Test: `pnpm test:e2e`
4. Verify the game runs: `pnpm dev`

## Coding Standards

- TypeScript strict mode
- React functional components with hooks
- ESLint + Prettier formatting
- Conventional commits (feat/fix/docs/test/chore)

## Authentication

```bash
# For GitHub operations
GH_TOKEN="$GITHUB_TOKEN" gh <command>
```
