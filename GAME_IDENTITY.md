# Rivers of Reckoning - Game Identity

> **A procedural roguelike adventure through infinite, ever-changing worlds**

## 🌊 Core Vision

**Rivers of Reckoning** is a browser-first 3D exploration RPG where players journey through procedurally generated landscapes. Every playthrough is unique—the same seed produces the same world, but the adventure is always fresh.

### The Name

*Rivers of Reckoning* evokes:
- **Rivers** - Flowing, ever-changing landscapes; the water systems that carve through biomes
- **Reckoning** - The moment of truth in combat; facing the consequences of exploration

### Design Pillars

1. **Instant Accessibility**
   - No downloads, no installs
   - Click and play in any browser
   - Mobile-ready via Capacitor

2. **Procedural Everything**
   - Terrain from noise functions
   - Weather from probability systems
   - Enemies from spawn algorithms
   - Every world reproducible via seed

3. **Exploration First**
   - Reward curiosity
   - Hidden secrets in every biome
   - Day/night changes what you find

4. **Responsive Combat**
   - Simple but satisfying
   - Risk/reward enemy encounters
   - Progression through XP and gear

## 🎨 Visual Identity

### Color Palette

| Element | Primary | Accent |
|---------|---------|--------|
| **Grassland** | `#3a5a2a` | `#FFD700` |
| **Forest** | `#2a4a2a` | `#90EE90` |
| **Marsh** | `#4a6a3a` | `#87CEEB` |
| **Desert** | `#EDC9AF` | `#FF8C00` |
| **Tundra** | `#F5F5F5` | `#87CEEB` |
| **UI Primary** | `#4CAF50` | `#8BC34A` |
| **UI Danger** | `#f44336` | `#ff5252` |

### Typography

- **Title**: "Press Start 2P" - Retro pixel font
- **Body**: Roboto Mono - Clean, readable
- **HUD**: System fonts for performance

### Art Direction

- **3D with stylized elements** - Not photorealistic, not pixel art
- **Dynamic lighting** - Day/night cycle affects mood
- **Weather as character** - Rain, fog, snow change the experience
- **Readable silhouettes** - Enemies visible at distance

## 🎮 Gameplay Loop

```
┌─────────────────────────────────────────────┐
│                 EXPLORE                      │
│  Move through biomes, discover secrets      │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│                 ENCOUNTER                    │
│  Enemies appear based on biome & time       │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│                 COMBAT                       │
│  Attack with timing, avoid damage           │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│                 REWARD                       │
│  XP → Level up → Stronger                   │
│  Gold → Shop → Better gear                  │
└─────────────────┬───────────────────────────┘
                  ▼
        (Return to EXPLORE)
```

## 🌍 World Structure

### Biomes (6 Types)

| Biome | Temperature | Moisture | Character |
|-------|-------------|----------|-----------|
| **Grassland** | Mild | Low | Starting area, gentle |
| **Forest** | Mild | Medium | Dense, mysterious |
| **Marsh** | Warm | High | Dangerous, rewarding |
| **Desert** | Hot | Very Low | Harsh, treasures |
| **Tundra** | Cold | Medium | Unforgiving, rare loot |
| **Caves** | Cool | Medium | End-game challenge |

### Enemy Types (5 Core)

| Enemy | Speed | Damage | Health | Behavior |
|-------|-------|--------|--------|----------|
| **Slime** | Slow | Low | Low | Wanders aimlessly |
| **Goblin** | Fast | Medium | Low | Aggressive chase |
| **Orc** | Medium | High | High | Territorial |
| **Wraith** | Very Fast | Medium | Low | Ambush predator |
| **Wolf** | Fast | Medium | Medium | Pack tactics |

## 📊 Progression System

### Experience Curve

- Level 1→2: 100 XP
- Level 2→3: 150 XP (×1.5)
- Level 10→11: ~3,834 XP
- Level 20→21: ~316,912 XP
- **Soft cap at Level 50** (prevents infinite grind)

### Health Scaling

- Base: 100 HP
- Per level: +10 HP
- Level 50: 590 HP max

### Combat Scaling

- Base damage: 10
- Per level: +2 damage
- Level 50: 108 damage

## 🎵 Audio Identity

### Procedural Audio (via Strata)

- **Ambient**: Biome-specific background (wind, water, creatures)
- **Weather**: Rain, thunder, wind intensity
- **Combat**: Attack swooshes, enemy growls, damage feedback
- **UI**: Menu clicks, level-up fanfare

### Music Philosophy

- Adaptive to gameplay state
- Tension builds during combat
- Calm during exploration
- Triumphant on achievement

## 🎯 Target Experience

### First 30 Seconds
1. Title screen with clear "Start" button
2. World generates instantly
3. Player can move with WASD
4. Enemy visible within view

### First 5 Minutes
1. First combat encounter
2. Level up once
3. Experience weather change
4. See day/night transition

### Session Goals
- **Quick session (5 min)**: Explore one biome, defeat 3-5 enemies
- **Medium session (15 min)**: Cross multiple biomes, level up 2-3 times
- **Long session (30+ min)**: Full exploration, boss encounter, significant progression

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| **Desktop Web** | ✅ Primary | Chrome, Firefox, Safari |
| **Mobile Web** | ✅ Supported | Touch controls |
| **iOS App** | 🔧 Capacitor | Future release |
| **Android App** | 🔧 Capacitor | Future release |

## 🔮 Future Vision

### Phase 1 (Current)
- Core exploration
- Basic combat
- Weather & time systems

### Phase 2
- Boss encounters
- Shop system
- Save/load

### Phase 3
- Multiplayer seeds
- Leaderboards
- Achievements

---

*Rivers of Reckoning: Where every river leads to adventure, and every reckoning makes you stronger.*
