import { fbm } from '@jbcom/strata'

/**
 * Calculates terrain height at a given point using Strata's FBM.
 * Shared between terrain rendering, player movement, and enemy AI.
 */
export function getTerrainHeight(x: number, z: number): number {
  // Same logic as in App.tsx
  const baseHeight = fbm(x * 0.02, 0, z * 0.02, 6) * 8
  const largeScale = fbm(x * 0.008, 0.1, z * 0.008, 4) * 12
  return Math.max(0, baseHeight + largeScale)
}

/**
 * Validates if the generated map data is within reasonable bounds.
 */
export function validateMapBounds(size: number, _seed: number): boolean {
  // Sample some points on the map
  const samples = 10
  const step = size / samples
  
  for (let x = -size / 2; x <= size / 2; x += step) {
    for (let z = -size / 2; z <= size / 2; z += step) {
      const h = getTerrainHeight(x, z)
      if (isNaN(h) || h < 0 || h > 100) return false // Heights should be 0-100 in this game
    }
  }
  return true
}
