import { describe, it, expect, vi } from 'vitest'

vi.mock('@jbcom/strata', () => ({
  fbm: (x: number, _y: number, z: number, _octaves?: number) => {
    // Simple deterministic mock for fbm
    return Math.sin(x) * Math.cos(z) * 0.5 + 0.5
  }
}))

import { getTerrainHeight, validateMapBounds } from './terrain'
import { WORLD } from '../constants/game'

describe('Terrain Utilities', () => {
  it('should return consistent height for same coordinates', () => {
    const h1 = getTerrainHeight(10, 20)
    const h2 = getTerrainHeight(10, 20)
    expect(h1).toBe(h2)
  })

  it('should return different heights for different coordinates', () => {
    const h1 = getTerrainHeight(10, 20)
    const h2 = getTerrainHeight(30, 40)
    expect(h1).not.toBe(h2)
  })

  it('should produce valid map within bounds', () => {
    const isValid = validateMapBounds(WORLD.TERRAIN_SIZE, 12345)
    expect(isValid).toBe(true)
  })

  it('should have heights mostly above zero', () => {
    // FBM terrain can have some low spots, but we expect mostly positive values
    let positiveCount = 0
    const samples = 100
    for (let i = 0; i < samples; i++) {
      const h = getTerrainHeight(i * 2, i * 3)
      if (h >= 0) positiveCount++
    }
    expect(positiveCount).toBeGreaterThan(samples * 0.9)
  })
})
