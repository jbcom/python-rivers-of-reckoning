# Rivers of Reckoning

**A procedural 3D RPG built with Strata in 30 lines of code** 🎮

## 🚀 Quick Start

```bash
pnpm install
pnpm dev
```

## 🎮 What Is This?

Rivers of Reckoning is a fully procedural 3D RPG that showcases the power of the [Strata](https://github.com/jbcom/nodejs-strata) 3D graphics library. What used to require 2,000+ lines of Python code is now just **30 lines of TypeScript**.

## ✨ Features

All powered by Strata's built-in components:

- 🌍 **Procedural Terrain** - GPU-powered with 5 unique biomes
- 💧 **Realistic Water** - Caustics, foam, and flow simulation  
- 🌤️ **Dynamic Weather** - Rain, fog, snow, storm systems
- 🌅 **Day/Night Cycle** - Volumetric sky with time progression
- 🌲 **Vegetation** - Instanced grass, trees, and rocks
- 🎮 **Player Character** - Full controller with physics
- �� **Procedural Audio** - Adaptive music and ambient sounds
- 🎨 **Game State** - Built-in management system
- 📊 **HUD Components** - Health, stats, and UI overlays

### Biomes

1. **Marsh** - Water-heavy wetlands (temp: moderate, moisture: high)
2. **Forest** - Dense woodland (temp: moderate, moisture: medium)
3. **Desert** - Arid wasteland (temp: hot, moisture: low)
4. **Tundra** - Frozen landscape (temp: cold, moisture: variable)
5. **Grassland** - Open plains (temp: moderate, moisture: low)

## 📁 Project Structure

```
.
├── src/
│   ├── App.tsx          # The entire game (30 lines)
│   └── main.tsx         # React entry point
├── tests/
│   ├── game.spec.ts     # Playwright E2E tests
│   └── README.md        # Test documentation
├── public/
│   └── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🧪 Testing

Comprehensive end-to-end tests with Playwright:

```bash
# Install browsers (first time)
pnpm exec playwright install

# Run tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui
```

### Test Coverage

- ✅ Game loads and renders (WebGL initialization)
- ✅ Terrain and water render correctly
- ✅ Day/night cycle progression
- ✅ Weather system operations  
- ✅ Camera controls (mouse interaction)
- ✅ Performance (60+ FPS)
- ✅ Error-free execution
- ✅ Screenshot generation for visual verification

## 🏗️ Build

```bash
# Development
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

## 📚 Documentation

- [`STRATA_VS_PYGAME.md`](./STRATA_VS_PYGAME.md) - Comparison with the old Python version
- [`python-archive/`](./python-archive/) - Archived Python/pygame implementation
- [`tests/README.md`](./tests/README.md) - Testing documentation

## 🎯 The Story

This project started as a Python/pygame game that was, in the words of its creator, "a train wreck inside a crashed plane shoved inside a dying star." It had:

- 2,000+ lines of manual code
- Broken tests
- Missing features
- No way to verify if it worked

With Strata, it became:

- **30 lines of declarative code**
- Fully tested with 8 E2E tests
- All features working out of the box
- Built in 5 minutes

## 🛠️ Tech Stack

- [**Strata**](https://github.com/jbcom/nodejs-strata) - Procedural 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Playwright** - End-to-end testing

## 📜 License

MIT

---

Built with [Strata](https://github.com/jbcom/nodejs-strata) 🎨
