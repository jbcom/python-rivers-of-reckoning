/**
 * Zustand game store - replaces Python ECS world state
 * Ported from: src/first_python_rpg/systems.py GameWorld class
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  BiomeType,
  TimePhase,
  WeatherType,
  GameState,
  PlayerStats,
  Health,
  Stamina,
  Position,
  TimeOfDay,
  Weather,
  WorldState,
} from '../types/game'

interface GameStore {
  // Game state
  gameState: GameState
  setGameState: (state: GameState) => void

  // Player
  playerPosition: Position
  playerHealth: Health
  playerStamina: Stamina
  playerStats: PlayerStats
  movePlayer: (dx: number, dy: number, dz: number) => void
  damagePlayer: (amount: number) => void
  healPlayer: (amount: number) => void
  addGold: (amount: number) => void
  addExperience: (amount: number) => void

  // Time system
  timeOfDay: TimeOfDay
  updateTime: (dt: number) => void

  // Weather system
  weather: Weather
  updateWeather: (dt: number) => void
  changeWeather: () => void

  // World state
  worldState: WorldState
  updateBiome: (biome: BiomeType) => void
  incrementEnemiesDefeated: () => void
  incrementBossesDefeated: () => void

  // Game actions
  startGame: (seed?: number) => void
  pauseGame: () => void
  resumeGame: () => void
  endGame: () => void
  resetGame: () => void
}

const getTimePhase = (hour: number): TimePhase => {
  if (hour >= 5 && hour < 7) return TimePhase.DAWN
  if (hour >= 7 && hour < 18) return TimePhase.DAY
  if (hour >= 18 && hour < 20) return TimePhase.DUSK
  return TimePhase.NIGHT
}

/**
 * Seeded Random Number Generator for deterministic world generation.
 * Addresses PR feedback about non-deterministic world generation.
 */
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  nextInRange(min: number, max: number): number {
    return min + this.next() * (max - min)
  }
}

// Global seeded RNG instance - initialized with world seed
let gameRng: SeededRandom | null = null

const getSeededRandom = (seed: number): number => {
  if (!gameRng) {
    gameRng = new SeededRandom(seed)
  }
  return gameRng.next()
}

const getRandomWeather = (seed: number): WeatherType => {
  const choices: [WeatherType, number][] = [
    [WeatherType.CLEAR, 0.5],
    [WeatherType.RAIN, 0.2],
    [WeatherType.FOG, 0.15],
    [WeatherType.SNOW, 0.1],
    [WeatherType.STORM, 0.05],
  ]

  const total = choices.reduce((sum, [, weight]) => sum + weight, 0)
  const r = getSeededRandom(seed) * total
  let cumulative = 0

  for (const [weather, weight] of choices) {
    cumulative += weight
    if (r <= cumulative) return weather
  }

  return WeatherType.CLEAR
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial game state
    gameState: 'title',
    setGameState: (state) => set({ gameState: state }),

    // Player initial state
    playerPosition: { x: 0, y: 0, z: 0 },
    playerHealth: { current: 100, maximum: 100, regenRate: 0.5 },
    playerStamina: { current: 100, maximum: 100, regenRate: 10 },
    playerStats: {
      gold: 0,
      score: 0,
      level: 1,
      experience: 0,
      expToNext: 100,
      mana: 50,
      maxMana: 50,
    },

    movePlayer: (dx, dy, dz) =>
      set((state) => {
        const newPos = {
          x: state.playerPosition.x + dx,
          y: state.playerPosition.y + dy,
          z: state.playerPosition.z + dz,
        }
        return {
          playerPosition: newPos,
          worldState: {
            ...state.worldState,
            distanceTraveled: state.worldState.distanceTraveled + Math.sqrt(dx * dx + dy * dy + dz * dz),
          },
        }
      }),

    damagePlayer: (amount) =>
      set((state) => {
        const newHealth = Math.max(0, state.playerHealth.current - amount)
        if (newHealth <= 0) {
          return {
            playerHealth: { ...state.playerHealth, current: 0 },
            gameState: 'gameover',
          }
        }
        return {
          playerHealth: { ...state.playerHealth, current: newHealth },
        }
      }),

    healPlayer: (amount) =>
      set((state) => ({
        playerHealth: {
          ...state.playerHealth,
          current: Math.min(state.playerHealth.maximum, state.playerHealth.current + amount),
        },
      })),

    addGold: (amount) =>
      set((state) => ({
        playerStats: {
          ...state.playerStats,
          gold: state.playerStats.gold + amount,
          score: state.playerStats.score + amount,
        },
      })),

    addExperience: (amount) =>
      set((state) => {
        let exp = state.playerStats.experience + amount
        let level = state.playerStats.level
        let expToNext = state.playerStats.expToNext

        while (exp >= expToNext) {
          exp -= expToNext
          level += 1
          expToNext = Math.floor(expToNext * 1.5)
        }

        return {
          playerStats: {
            ...state.playerStats,
            experience: exp,
            level,
            expToNext,
          },
          playerHealth: {
            ...state.playerHealth,
            maximum: 100 + (level - 1) * 10,
          },
        }
      }),

    // Time system
    timeOfDay: {
      hour: 8.0,
      phase: TimePhase.DAY,
      timeScale: 60.0,
      dayCount: 1,
    },

    updateTime: (dt) =>
      set((state) => {
        let hour = state.timeOfDay.hour + (dt * state.timeOfDay.timeScale) / 3600
        let dayCount = state.timeOfDay.dayCount

        if (hour >= 24) {
          hour -= 24
          dayCount += 1
        }

        return {
          timeOfDay: {
            ...state.timeOfDay,
            hour,
            dayCount,
            phase: getTimePhase(hour),
          },
        }
      }),

    // Weather system
    weather: {
      current: WeatherType.CLEAR,
      intensity: 0.5,
      duration: 300,
      windSpeed: 0,
      windAngle: 0,
    },

    updateWeather: (dt) =>
      set((state) => {
        const newDuration = state.weather.duration - dt

        if (newDuration <= 0) {
          get().changeWeather()
          return {}
        }

        return {
          weather: {
            ...state.weather,
            duration: newDuration,
            windAngle: state.weather.windAngle + (Math.random() - 0.5) * 0.2 * dt,
            windSpeed: Math.max(0, state.weather.windSpeed + (Math.random() - 0.5) * dt),
          },
        }
      }),

    changeWeather: () =>
      set((state) => {
        const seed = state.worldState.seed
        const newWeather = getRandomWeather(seed)
        
        // Use seeded random for deterministic weather
        const rng = new SeededRandom(seed + state.timeOfDay.dayCount * 1000)
        let windSpeed = rng.next()

        if (newWeather === WeatherType.STORM) {
          windSpeed = 3 + rng.next() * 3
        } else if (newWeather === WeatherType.RAIN) {
          windSpeed = 1 + rng.next() * 2
        }

        return {
          weather: {
            current: newWeather,
            intensity: 0.3 + rng.next() * 0.7,
            duration: 60 + rng.next() * 240,
            windSpeed,
            windAngle: rng.next() * Math.PI * 2,
          },
        }
      }),

    // World state
    worldState: {
      currentBiome: BiomeType.GRASSLAND,
      difficulty: 1.0,
      enemiesDefeated: 0,
      bossesDefeated: 0,
      distanceTraveled: 0,
      seed: Date.now(),
    },

    updateBiome: (biome) =>
      set((state) => ({
        worldState: { ...state.worldState, currentBiome: biome },
      })),

    incrementEnemiesDefeated: () =>
      set((state) => ({
        worldState: {
          ...state.worldState,
          enemiesDefeated: state.worldState.enemiesDefeated + 1,
        },
        playerStats: {
          ...state.playerStats,
          score: state.playerStats.score + 10,
        },
      })),

    incrementBossesDefeated: () =>
      set((state) => ({
        worldState: {
          ...state.worldState,
          bossesDefeated: state.worldState.bossesDefeated + 1,
        },
        playerStats: {
          ...state.playerStats,
          score: state.playerStats.score + 100,
        },
      })),

    // Game actions
    startGame: (seed) =>
      set({
        gameState: 'playing',
        playerPosition: { x: 0, y: 0, z: 0 },
        playerHealth: { current: 100, maximum: 100, regenRate: 0.5 },
        playerStamina: { current: 100, maximum: 100, regenRate: 10 },
        playerStats: {
          gold: 0,
          score: 0,
          level: 1,
          experience: 0,
          expToNext: 100,
          mana: 50,
          maxMana: 50,
        },
        timeOfDay: {
          hour: 8.0,
          phase: TimePhase.DAY,
          timeScale: 60.0,
          dayCount: 1,
        },
        weather: {
          current: WeatherType.CLEAR,
          intensity: 0.5,
          duration: 300,
          windSpeed: 0,
          windAngle: 0,
        },
        worldState: {
          currentBiome: BiomeType.GRASSLAND,
          difficulty: 1.0,
          enemiesDefeated: 0,
          bossesDefeated: 0,
          distanceTraveled: 0,
          seed: seed ?? Date.now(),
        },
      }),

    pauseGame: () => set({ gameState: 'paused' }),
    resumeGame: () => set({ gameState: 'playing' }),
    endGame: () => set({ gameState: 'gameover' }),
    resetGame: () => set({ gameState: 'title' }),
  }))
)
