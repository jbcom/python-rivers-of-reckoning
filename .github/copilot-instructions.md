# Copilot Instructions - Rivers of Reckoning

## 🌊 What Is This Game?

Rivers of Reckoning is a **web-first procedural 3D roguelike RPG**. Players explore infinite generated worlds directly in their browser using React Three Fiber and the Strata engine—no downloads, no installs.

### The Player Experience

- Click a link → instantly playing in the browser
- Explore 3D marshes, forests, deserts, tundra
- Every world is unique (generated from seeds using fbm noise)
- Dynamic weather system and day/night cycle
- Responsive controls (Desktop & Mobile)

## 🎯 Design Rules

1. **Web-First**: Browser is the primary platform (Vite/React)
2. **Procedural**: Everything generated from seeds; no hardcoded maps
3. **Performant**: Target 60fps using instanced rendering and GPU-accelerated terrain
4. **Responsive**: Works on desktop, tablet, and mobile (Capacitor support)
5. **State Management**: Use Zustand for global game state

## 🛠 Tech Stack

- **React Three Fiber**: 3D renderer for React
- **Three.js**: Underling 3D engine
- **@jbcom/strata**: Procedural terrain, vegetation, weather, and game systems
- **Zustand**: Lightweight state management
- **Material-UI**: Professional UI components for menus and HUD
- **Vite**: Ultra-fast build tool and dev server

## 📁 Key Files

```
src/
├── App.tsx             # Main 3D scene composition
├── main.tsx            # React entry point
├── store/
│   └── gameStore.ts    # Central Zustand state
├── components/         # React UI components
│   ├── TitleScreen.tsx
│   ├── GameHUD.tsx
│   ├── PauseMenu.tsx
│   └── GameOverScreen.tsx
└── types/
    └── game.ts         # TypeScript definitions
```

## ⚡ Quick Commands

```bash
pnpm dev                # Run development server
pnpm build              # Build for production (Vite)
pnpm test:e2e           # Run Playwright E2E tests
pnpm lint               # Run ESLint
pnpm typecheck          # Run TypeScript checks
```

## ✅ When Writing Code

- Use **React functional components** with hooks
- Use **useFrame** for game loop updates (avoid setInterval)
- Prefer **instanced rendering** for repeated objects (Grass, Trees)
- Use **TypeScript strict mode** for type safety
- Follow the **Strata API** for procedural generation (fbm, noise3D)
- Use **Material-UI** for all 2D UI overlays

## 🚫 Don't Do This

- **Don't use Math.random()** for world generation; use the `SeededRandom` class
- **Don't use Python** or pygbag; the project has been fully migrated to TypeScript
- **Don't add heavy dependencies** that impact web load times
- **Don't bypass the Zustand store** for global game state
