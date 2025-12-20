# AGENTS.md - Rivers of Reckoning

> **Instructions for AI agents working on this 3D procedural RPG**

## 🌊 Game Identity

**Rivers of Reckoning** is a browser-based 3D roguelike RPG where players explore infinite procedurally generated worlds. Built with TypeScript, React Three Fiber, and [@jbcom/strata](https://www.npmjs.com/package/@jbcom/strata).

### Mission Statement

*Create an immersive, endlessly replayable adventure that runs perfectly in any web browser, with no downloads, no installs, and no waiting.*

## 🎯 Design Principles

| Principle | What It Means |
|-----------|---------------|
| **Web-First** | Browser is the primary platform |
| **Instant Play** | Game loads fast and starts immediately |
| **Procedural** | Everything generated from seeds |
| **Responsive** | Works on desktop, tablet, and mobile |
| **Performant** | 60fps target with efficient rendering |

## 🛠 Technology

| Layer | Tech | Why |
|-------|------|-----|
| 3D Engine | @jbcom/strata | Procedural terrain, vegetation, weather, audio, AI |
| Rendering | React Three Fiber | React-style Three.js development |
| UI | Material-UI | Consistent, accessible UI components |
| State | Zustand | Fast, simple state management |
| Build | Vite | Modern, fast bundler |
| Tests | Playwright | Cross-browser E2E testing |
| Mobile | Capacitor | Native iOS/Android deployment |

## 📁 Structure

```
src/
├── App.tsx                 # Main 3D game scene
├── main.tsx                # React entry point
├── components/             # UI components
│   ├── TitleScreen.tsx
│   ├── GameHUD.tsx
│   ├── PauseMenu.tsx
│   └── GameOverScreen.tsx
├── store/
│   └── gameStore.ts        # Zustand state
└── types/
    └── game.ts             # TypeScript types
```

## 🔧 Commands

```bash
pnpm dev            # Start dev server
pnpm build          # Production build
pnpm test:e2e       # Run Playwright tests
pnpm lint           # ESLint
pnpm typecheck      # TypeScript check
```

## ✅ Agent Checklist

Before making changes:
- [ ] Understand the Strata API
- [ ] Read existing code patterns
- [ ] Run `pnpm typecheck` to confirm clean state

When making changes:
- [ ] Use real Strata APIs (no hallucinated components)
- [ ] Test that `pnpm dev` runs
- [ ] Ensure type checks pass
- [ ] Follow React/Three.js best practices

After changes:
- [ ] `pnpm lint` passes
- [ ] `pnpm test:e2e` passes
- [ ] Update docs if needed

## ❌ What NOT to Do

- **Don't** hallucinate Strata APIs - check PUBLIC_API.md
- **Don't** use setInterval for game loops - use useFrame
- **Don't** use Math.random() for procedural content - use seeded RNG
- **Don't** make blocking synchronous calls
- **Don't** add Python code - this is TypeScript only

## 🎨 Key Strata APIs

```typescript
// Core algorithms
import { fbm, noise3D } from '@jbcom/strata'

// Vegetation
import { createGrassInstances, createTreeInstances, createRockInstances } from '@jbcom/strata'

// Components
import { ProceduralSky, Rain, Snow } from '@jbcom/strata'

// Post-processing
import { CinematicEffects, RealisticEffects } from '@jbcom/strata'

// AI (YukaJS integration)
import { YukaEntityManager, YukaVehicle, YukaStateMachine } from '@jbcom/strata'

// State presets
import { RPG_STATE_PRESET, getStatePreset } from '@jbcom/strata'
```

## 📝 Commit Format

```
feat(terrain): add river valley generation
fix(weather): correct rain particle direction
docs: update strata integration guide
test: add biome transition tests
chore: update dependencies
```

## 🔗 Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main 3D scene composition |
| `src/store/gameStore.ts` | Game state management |
| `src/types/game.ts` | TypeScript definitions |
| `src/components/GameHUD.tsx` | In-game UI overlay |

## Agent-Specific Notes

### Claude
- Focus on architecture and complex refactoring
- Verify Strata API usage against actual docs

### Copilot
- Good for targeted fixes and feature additions
- Check component patterns in existing code

### Cursor
- IDE-integrated development
- Use .cursor/rules/*.mdc for context
