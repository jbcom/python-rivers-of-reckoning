/**
 * Game Constants - Rivers of Reckoning
 * 
 * Centralized configuration for all game mechanics.
 * Extract magic numbers to maintain consistency and allow easy tuning.
 */

// =============================================================================
// PLAYER CONSTANTS
// =============================================================================

export const PLAYER = {
  // Movement
  SPEED: 15,
  WORLD_BOUNDS: 95,

  // Combat
  BASE_DAMAGE: 10,
  DAMAGE_PER_LEVEL: 2,
  ATTACK_COOLDOWN: 0.5, // seconds
  ATTACK_RANGE: 3,

  // Stats
  INITIAL_HEALTH: 100,
  INITIAL_STAMINA: 100,
  INITIAL_GOLD: 0,
  HEALTH_PER_LEVEL: 10,
  STAMINA_REGEN_RATE: 10,
  HEALTH_REGEN_RATE: 0.5,
} as const

// =============================================================================
// ENEMY CONSTANTS
// =============================================================================

export const ENEMY = {
  // AI Behavior
  DETECTION_RANGE: 20,
  ATTACK_RANGE: 2,
  WANDER_RANGE: 20,
  MIN_WANDER_TIME: 2,
  MAX_WANDER_TIME: 3,
  ATTACK_COOLDOWN: 1000, // milliseconds

  // Spawning
  MIN_SPAWN_COUNT: 10,
  MAX_SPAWN_ADDITIONAL: 6,
  SPAWN_AREA_SIZE: 180,
} as const

// =============================================================================
// TIME CONSTANTS
// =============================================================================

export const TIME = {
  // Day phases (hours)
  DAWN_START: 5,
  DAWN_END: 7,
  DAY_END: 18,
  DUSK_END: 20,

  // Time progression
  TIME_SCALE: 60.0, // Game seconds per real second
  STARTING_HOUR: 8.0,
} as const

// =============================================================================
// WEATHER CONSTANTS
// =============================================================================

export const WEATHER = {
  // Duration (seconds)
  MIN_DURATION: 60,
  MAX_ADDITIONAL_DURATION: 240,

  // Probabilities (should sum to 1.0)
  CLEAR_WEIGHT: 0.5,
  RAIN_WEIGHT: 0.2,
  FOG_WEIGHT: 0.15,
  SNOW_WEIGHT: 0.1,
  STORM_WEIGHT: 0.05,
} as const

// =============================================================================
// WORLD CONSTANTS
// =============================================================================

export const WORLD = {
  // Terrain
  TERRAIN_SIZE: 200,
  TERRAIN_SEGMENTS: 256,
  VEGETATION_AREA: 100,

  // Vegetation counts
  GRASS_COUNT: 3000,
  TREE_COUNT: 150,
  ROCK_COUNT: 80,

  // Water
  WATER_LEVEL: -0.5,
} as const

// =============================================================================
// EXPERIENCE/LEVELING CONSTANTS
// =============================================================================

export const LEVELING = {
  BASE_XP_REQUIRED: 100,
  XP_MULTIPLIER: 1.5, // Exponential growth
  MAX_LEVEL: 50, // Soft cap to prevent extreme grind
} as const

// =============================================================================
// CAMERA CONSTANTS
// =============================================================================

export const CAMERA = {
  INITIAL_POSITION: [40, 30, 40] as [number, number, number],
  FOV: 60,
  MIN_DISTANCE: 5,
  MAX_DISTANCE: 50,
  DAMPING_FACTOR: 0.05,
} as const
