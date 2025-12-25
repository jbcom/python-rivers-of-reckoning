import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import { PLAYER, TIME, LEVELING } from '../constants/game'

describe('GameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    useGameStore.getState().startGame(12345) // Seeded start
  })

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      const state = useGameStore.getState()
      expect(state.gameState).toBe('playing')
      expect(state.playerPosition).toEqual({ x: 0, y: 0, z: 0 })
      expect(state.playerHealth.current).toBe(PLAYER.INITIAL_HEALTH)
      expect(state.playerStats.level).toBe(1)
      expect(state.playerStats.gold).toBe(PLAYER.INITIAL_GOLD)
      expect(state.timeOfDay.hour).toBe(TIME.STARTING_HOUR)
    })
  })

  describe('Player Actions', () => {
    it('should move player correctly', () => {
      const { movePlayer } = useGameStore.getState()
      movePlayer(1, 0, 1)
      
      const state = useGameStore.getState()
      expect(state.playerPosition.x).toBe(1)
      expect(state.playerPosition.z).toBe(1)
      expect(state.worldState.distanceTraveled).toBeGreaterThan(0)
    })

    it('should clamp player movement to world bounds', () => {
      const { movePlayer } = useGameStore.getState()
      // Move way beyond bounds
      movePlayer(PLAYER.WORLD_BOUNDS + 100, 0, PLAYER.WORLD_BOUNDS + 100)
      
      const state = useGameStore.getState()
      expect(state.playerPosition.x).toBe(PLAYER.WORLD_BOUNDS)
      expect(state.playerPosition.z).toBe(PLAYER.WORLD_BOUNDS)
    })

    it('should skip tiny movements', () => {
      const { movePlayer } = useGameStore.getState()
      movePlayer(0.005, 0, 0)
      
      const state = useGameStore.getState()
      expect(state.playerPosition.x).toBe(0)
    })

    it('should handle damage and game over', () => {
      const { damagePlayer } = useGameStore.getState()
      damagePlayer(PLAYER.INITIAL_HEALTH + 10)
      
      const state = useGameStore.getState()
      expect(state.playerHealth.current).toBe(0)
      expect(state.gameState).toBe('gameover')
    })

    it('should heal player up to maximum', () => {
      const { damagePlayer, healPlayer } = useGameStore.getState()
      damagePlayer(50)
      healPlayer(20)
      
      let state = useGameStore.getState()
      expect(state.playerHealth.current).toBe(PLAYER.INITIAL_HEALTH - 50 + 20)
      
      healPlayer(100)
      state = useGameStore.getState()
      expect(state.playerHealth.current).toBe(state.playerHealth.maximum)
    })

    it('should add gold and update score', () => {
      const { addGold } = useGameStore.getState()
      addGold(100)
      
      const state = useGameStore.getState()
      expect(state.playerStats.gold).toBe(PLAYER.INITIAL_GOLD + 100)
      expect(state.playerStats.score).toBe(100)
    })

    it('should handle experience and level up', () => {
      const { addExperience } = useGameStore.getState()
      addExperience(LEVELING.BASE_XP_REQUIRED + 10)
      
      const state = useGameStore.getState()
      expect(state.playerStats.level).toBe(2)
      expect(state.playerStats.experience).toBe(10)
      expect(state.playerHealth.maximum).toBeGreaterThan(PLAYER.INITIAL_HEALTH)
    })
  })

  describe('Time and Weather', () => {
    it('should update time correctly', () => {
      const { updateTime } = useGameStore.getState()
      // dt is in seconds. 3600 seconds = 1 hour.
      // 1 hour in game time = (dt * timeScale) / 3600.
      // Default timeScale is 60 (1 real minute = 1 game hour).
      // So dt = 60 seconds should be 1 hour if timeScale = 60.
      updateTime(60)
      
      const state = useGameStore.getState()
      expect(state.timeOfDay.hour).toBeGreaterThan(TIME.STARTING_HOUR)
    })

    it('should handle day rollover', () => {
      const { updateTime } = useGameStore.getState()
      // Update by 24 hours (24 * 60 seconds if scale is 60)
      updateTime(24 * 60)
      
      const state = useGameStore.getState()
      expect(state.timeOfDay.dayCount).toBe(2)
      expect(state.timeOfDay.hour).toBeCloseTo(TIME.STARTING_HOUR, 1)
    })

    it('should change weather when duration expires', () => {
      const { updateWeather } = useGameStore.getState()
      
      // Force weather change by passing large dt
      updateWeather(10000)
      
      const state = useGameStore.getState()
      // Since it's random but seeded, it might still be CLEAR, but duration should be reset
      expect(state.weather.duration).toBeGreaterThan(0)
    })
  })

  describe('Game State Transitions', () => {
    it('should handle pause and resume', () => {
      const { pauseGame, resumeGame } = useGameStore.getState()
      
      pauseGame()
      expect(useGameStore.getState().gameState).toBe('paused')
      
      resumeGame()
      expect(useGameStore.getState().gameState).toBe('playing')
    })

    it('should reset game to title', () => {
      const { resetGame } = useGameStore.getState()
      resetGame()
      expect(useGameStore.getState().gameState).toBe('title')
    })
  })
})
