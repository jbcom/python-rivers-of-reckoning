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
import { PLAYER, TIME, WEATHER, LEVELING } from '../constants/game'

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
  if (hour >= TIME.DAWN_START && hour < TIME.DAWN_END) return TimePhase.DAWN
  if (hour >= TIME.DAWN_END && hour < TIME.DAY_END) return TimePhase.DAY
  if (hour >= TIME.DAY_END && hour < TIME.DUSK_END) return TimePhase.DUSK
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
    [WeatherType.CLEAR, WEATHER.CLEAR_WEIGHT],
    [WeatherType.RAIN, WEATHER.RAIN_WEIGHT],
    [WeatherType.FOG, WEATHER.FOG_WEIGHT],
    [WeatherType.SNOW, WEATHER.SNOW_WEIGHT],
    [WeatherType.STORM, WEATHER.STORM_WEIGHT],
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

    // Player initial state (using constants)
    playerPosition: { x: 0, y: 0, z: 0 },
    playerHealth: { 
      current: PLAYER.INITIAL_HEALTH, 
      maximum: PLAYER.INITIAL_HEALTH, 
      regenRate: PLAYER.HEALTH_REGEN_RATE 
    },
    playerStamina: { 
      current: PLAYER.INITIAL_STAMINA, 
      maximum: PLAYER.INITIAL_STAMINA, 
      regenRate: PLAYER.STAMINA_REGEN_RATE 
    },
    playerStats: {
      gold: PLAYER.INITIAL_GOLD,
      score: 0,
      level: 1,
      experience: 0,
      expToNext: LEVELING.BASE_XP_REQUIRED,
      mana: 50,
      maxMana: 50,
    },

    movePlayer: (dx, dy, dz) => {
      // Performance optimization: Skip tiny movements to reduce state updates
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (distance < 0.01) return // Threshold for minimum movement
      
      set((state) => ({
        playerPosition: {
          x: state.playerPosition.x + dx,
          y: state.playerPosition.y + dy,
          z: state.playerPosition.z + dz,
        },
        worldState: {
          ...state.worldState,
          distanceTraveled: state.worldState.distanceTraveled + distance,
        },
      }))
    },

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

        // Level up loop with soft cap
        while (exp >= expToNext && level < LEVELING.MAX_LEVEL) {
          exp -= expToNext
          level += 1
          expToNext = Math.floor(expToNext * LEVELING.XP_MULTIPLIER)
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
            maximum: PLAYER.INITIAL_HEALTH + (level - 1) * PLAYER.HEALTH_PER_LEVEL,
          },
        }
      }),

    // Time system (using constants)
    timeOfDay: {
      hour: TIME.STARTING_HOUR,
      phase: TimePhase.DAY,
      timeScale: TIME.TIME_SCALE,
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

        // Use seeded random for deterministic wind variation
        // Seed based on current time for smooth variation
        const windSeed = state.worldState.seed + Math.floor(state.timeOfDay.hour * 100)
        const windRng = new SeededRandom(windSeed)

        return {
          weather: {
            ...state.weather,
            duration: newDuration,
            windAngle: state.weather.windAngle + (windRng.next() - 0.5) * 0.2 * dt,
            windSpeed: Math.max(0, state.weather.windSpeed + (windRng.next() - 0.5) * dt),
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
            duration: WEATHER.MIN_DURATION + rng.next() * WEATHER.MAX_ADDITIONAL_DURATION,
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

    // Game actions - reset to initial state using constants
    startGame: (seed) =>
      set({
        gameState: 'playing',
        playerPosition: { x: 0, y: 0, z: 0 },
        playerHealth: { 
          current: PLAYER.INITIAL_HEALTH, 
          maximum: PLAYER.INITIAL_HEALTH, 
          regenRate: PLAYER.HEALTH_REGEN_RATE 
        },
        playerStamina: { 
          current: PLAYER.INITIAL_STAMINA, 
          maximum: PLAYER.INITIAL_STAMINA, 
          regenRate: PLAYER.STAMINA_REGEN_RATE 
        },
        playerStats: {
          gold: PLAYER.INITIAL_GOLD,
          score: 0,
          level: 1,
          experience: 0,
          expToNext: LEVELING.BASE_XP_REQUIRED,
          mana: 50,
          maxMana: 50,
        },
        timeOfDay: {
          hour: TIME.STARTING_HOUR,
          phase: TimePhase.DAY,
          timeScale: TIME.TIME_SCALE,
          dayCount: 1,
        },
        weather: {
          current: WeatherType.CLEAR,
          intensity: 0.5,
          duration: WEATHER.MIN_DURATION + WEATHER.MAX_ADDITIONAL_DURATION / 2,
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
