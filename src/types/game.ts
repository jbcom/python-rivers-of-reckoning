/**
 * Game types ported from Python pygame version
 * Based on: src/first_python_rpg/world_gen.py and src/first_python_rpg/systems.py
 */

// ============================================================================
// BIOME SYSTEM (from world_gen.py)
// ============================================================================

export enum BiomeType {
  MARSH = 'marsh',
  FOREST = 'forest',
  DESERT = 'desert',
  TUNDRA = 'tundra',
  CAVES = 'caves',
  GRASSLAND = 'grassland',
}

export interface BiomeConfig {
  name: string
  baseColor: string
  accentColor: string
  treeDensity: number      // 0-1 chance of tree per valid tile
  rockDensity: number      // 0-1 chance of rock per valid tile
  waterDensity: number     // 0-1 chance of water per valid tile
  enemySpawnRate: number   // 0-1 base spawn rate
  staminaModifier: number  // Multiplier for stamina drain
  visibility: number       // 0-1 how far player can see
  temperature: number      // 0-1 temperature range
  moisture: number         // 0-1 moisture range
}

export const BIOME_CONFIGS: Record<BiomeType, BiomeConfig> = {
  [BiomeType.MARSH]: {
    name: 'Marsh',
    baseColor: '#4a3728',
    accentColor: '#90EE90',
    treeDensity: 0.1,
    rockDensity: 0.05,
    waterDensity: 0.3,
    enemySpawnRate: 0.3,
    staminaModifier: 1.1,
    visibility: 0.7,
    temperature: 0.5,
    moisture: 0.8,
  },
  [BiomeType.FOREST]: {
    name: 'Forest',
    baseColor: '#228B22',
    accentColor: '#90EE90',
    treeDensity: 0.35,
    rockDensity: 0.1,
    waterDensity: 0.05,
    enemySpawnRate: 0.4,
    staminaModifier: 1.0,
    visibility: 0.5,
    temperature: 0.5,
    moisture: 0.6,
  },
  [BiomeType.DESERT]: {
    name: 'Desert',
    baseColor: '#EDC9AF',
    accentColor: '#FF8C00',
    treeDensity: 0.02,
    rockDensity: 0.15,
    waterDensity: 0.01,
    enemySpawnRate: 0.2,
    staminaModifier: 1.5,
    visibility: 1.0,
    temperature: 0.9,
    moisture: 0.2,
  },
  [BiomeType.TUNDRA]: {
    name: 'Tundra',
    baseColor: '#F5F5F5',
    accentColor: '#87CEEB',
    treeDensity: 0.05,
    rockDensity: 0.2,
    waterDensity: 0.1,
    enemySpawnRate: 0.25,
    staminaModifier: 1.3,
    visibility: 0.8,
    temperature: 0.1,
    moisture: 0.5,
  },
  [BiomeType.GRASSLAND]: {
    name: 'Grassland',
    baseColor: '#7CFC00',
    accentColor: '#FFD700',
    treeDensity: 0.08,
    rockDensity: 0.05,
    waterDensity: 0.02,
    enemySpawnRate: 0.35,
    staminaModifier: 0.9,
    visibility: 0.9,
    temperature: 0.6,
    moisture: 0.4,
  },
  [BiomeType.CAVES]: {
    name: 'Caves',
    baseColor: '#2F2F2F',
    accentColor: '#8B008B',
    treeDensity: 0.0,
    rockDensity: 0.25,
    waterDensity: 0.1,
    enemySpawnRate: 0.5,
    staminaModifier: 1.0,
    visibility: 0.3,
    temperature: 0.4,
    moisture: 0.6,
  },
}

// ============================================================================
// TIME SYSTEM (from systems.py)
// ============================================================================

export enum TimePhase {
  DAWN = 'dawn',
  DAY = 'day',
  DUSK = 'dusk',
  NIGHT = 'night',
}

export interface TimeOfDay {
  hour: number           // 0-24
  phase: TimePhase
  timeScale: number      // Game seconds per real second
  dayCount: number
}

// ============================================================================
// WEATHER SYSTEM (from systems.py)
// ============================================================================

export enum WeatherType {
  CLEAR = 'clear',
  RAIN = 'rain',
  FOG = 'fog',
  SNOW = 'snow',
  STORM = 'storm',
}

export interface Weather {
  current: WeatherType
  intensity: number      // 0-1
  duration: number       // Seconds remaining
  windSpeed: number
  windAngle: number      // Radians
}

// ============================================================================
// ENTITY COMPONENTS (from systems.py)
// ============================================================================

export interface Position {
  x: number
  y: number
  z: number
}

export interface Velocity {
  dx: number
  dy: number
  dz: number
  maxSpeed: number
}

export interface Health {
  current: number
  maximum: number
  regenRate: number
}

export interface Stamina {
  current: number
  maximum: number
  regenRate: number
}

export interface Combat {
  attackDamage: number
  armor: number
  dodgeChance: number
  attackCooldown: number
  isAttacking: boolean
}

export interface PlayerStats {
  gold: number
  score: number
  level: number
  experience: number
  expToNext: number
  mana: number
  maxMana: number
}

export interface EnemyState {
  name: string
  state: 'idle' | 'wandering' | 'chasing' | 'attacking' | 'fleeing'
  detectionRange: number
  attackRange: number
  isBoss: boolean
  wanderTimer: number
}

// ============================================================================
// GAME STATE
// ============================================================================

export interface WorldState {
  currentBiome: BiomeType
  difficulty: number
  enemiesDefeated: number
  bossesDefeated: number
  distanceTraveled: number
  seed: number
}

export type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'boss'
