/**
 * Enemy System - Procedural enemy generation and AI
 * Ported from Python enemy.py and procedural_enemies.py
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ENEMY, PLAYER, DIFFICULTY } from '../constants/game'
import { combatEvents } from '../events/combatEvents'
import { useGameStore } from '../store/gameStore'

// Enemy types with different stats (matches GAME_IDENTITY.md)
const ENEMY_TYPES = [
  { name: 'Slime', color: '#4CAF50', speed: 2, damage: 5, health: 20, xp: 10, isBoss: false },
  { name: 'Goblin', color: '#8BC34A', speed: 4, damage: 8, health: 30, xp: 20, isBoss: false },
  { name: 'Orc', color: '#795548', speed: 3, damage: 15, health: 50, xp: 35, isBoss: false },
  { name: 'Wraith', color: '#9C27B0', speed: 5, damage: 12, health: 25, xp: 30, isBoss: false },
  { name: 'Wolf', color: '#607D8B', speed: 6, damage: 10, health: 35, xp: 25, isBoss: false },
  { name: 'Dragon', color: '#FF4500', speed: 2, damage: 40, health: 250, xp: 500, isBoss: true },
  { name: 'Gorgon', color: '#2E8B57', speed: 3, damage: 30, health: 200, xp: 400, isBoss: true },
] as const

// Seeded random for deterministic spawning
class SeededRandom {
  private seed: number
  constructor(seed: number) { this.seed = seed }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
  nextInt(max: number): number {
    return Math.floor(this.next() * max)
  }
  // Seeded range for wander timing - replaces Math.random() calls
  nextRange(min: number, max: number): number {
    return min + this.next() * (max - min)
  }
}

interface EnemyData {
  id: number
  type: typeof ENEMY_TYPES[number]
  position: THREE.Vector3
  health: number
  maxHealth: number
  state: 'idle' | 'wandering' | 'chasing' | 'attacking'
  targetPosition: THREE.Vector3
  stateTimer: number
  rng: SeededRandom // Each enemy gets its own RNG for behavior variance
}

interface EnemySystemProps {
  seed: number
  playerPosition: { x: number; y: number; z: number }
  heightFunction: (x: number, z: number) => number
  onEnemyDefeated: (xp: number, gold: number) => void
  onPlayerDamage: (damage: number) => void
}

export function EnemySystem({
  seed,
  playerPosition,
  heightFunction,
  onEnemyDefeated,
  onPlayerDamage,
}: EnemySystemProps) {
  const { worldState, incrementBossesDefeated } = useGameStore()
  const difficulty = DIFFICULTY[worldState.difficultyLevel]

  const [enemies, setEnemies] = useState<EnemyData[]>(() => {
    const rng = new SeededRandom(seed)
    const initialEnemies: EnemyData[] = []
    const count = ENEMY.MIN_SPAWN_COUNT + rng.nextInt(ENEMY.MAX_SPAWN_ADDITIONAL)
    const normalEnemyTypes = ENEMY_TYPES.filter(t => !t.isBoss)

    for (let i = 0; i < count; i++) {
      const type = normalEnemyTypes[rng.nextInt(normalEnemyTypes.length)]
      const x = (rng.next() - 0.5) * ENEMY.SPAWN_AREA_SIZE
      const z = (rng.next() - 0.5) * ENEMY.SPAWN_AREA_SIZE
      const y = heightFunction(x, z) + 0.5
      const enemyRng = new SeededRandom(seed + i * 1000)

      const health = type.health * difficulty.healthMult

      initialEnemies.push({
        id: i,
        type,
        position: new THREE.Vector3(x, Math.max(0.5, y), z),
        health,
        maxHealth: health,
        state: 'wandering',
        targetPosition: new THREE.Vector3(x, y, z),
        stateTimer: rng.next() * 5,
        rng: enemyRng,
      })
    }
    return initialEnemies
  })

  const spawnBoss = useCallback(() => {
    const bossTypes = ENEMY_TYPES.filter(t => t.isBoss)
    const type = bossTypes[Math.floor(Math.random() * bossTypes.length)]
    
    const x = (Math.random() - 0.5) * ENEMY.SPAWN_AREA_SIZE * 0.5
    const z = (Math.random() - 0.5) * ENEMY.SPAWN_AREA_SIZE * 0.5
    const y = heightFunction(x, z) + 1.0
    
    const health = type.health * difficulty.healthMult

    const newBoss: EnemyData = {
      id: Date.now(),
      type,
      position: new THREE.Vector3(x, y, z),
      health,
      maxHealth: health,
      state: 'chasing',
      targetPosition: new THREE.Vector3(x, y, z),
      stateTimer: 0,
      rng: new SeededRandom(Date.now()),
    }

    setEnemies(prev => [...prev, newBoss])
    console.log(`BOSS SPAWNED: ${type.name}!`)
  }, [difficulty.healthMult, heightFunction])

  // Spawn boss after 10 enemies defeated
  useEffect(() => {
    if (worldState.enemiesDefeated > 0 && worldState.enemiesDefeated % 10 === 0) {
      // Defer to avoid cascading renders warning
      const timer = setTimeout(() => spawnBoss(), 0)
      return () => clearTimeout(timer)
    }
  }, [worldState.enemiesDefeated, spawnBoss])
  
  const enemiesRef = useRef<EnemyData[]>(enemies)
  const meshRefs = useRef<Map<number, THREE.Mesh>>(new Map())
  const healthBarRefs = useRef<Map<number, THREE.Mesh>>(new Map())
  const lastAttackRef = useRef<Map<number, number>>(new Map())

  // Keep ref in sync with state for AI loop
  useEffect(() => {
    enemiesRef.current = enemies
  }, [enemies])

  // Subscribe to attack events from combat system
  useEffect(() => {
    const unsubscribe = combatEvents.onPlayerAttack((attackPos, range, damage) => {
      const attackPosition = new THREE.Vector3(attackPos.x, attackPos.y, attackPos.z)
      
      let changed = false
      const updatedEnemies = enemiesRef.current.map((enemy) => {
        if (enemy.health <= 0) return enemy
        
        const dist = enemy.position.distanceTo(attackPosition)
        if (dist <= range) {
          // Enemy in range - apply damage
          const newHealth = enemy.health - damage
          changed = true
          if (newHealth <= 0) {
            // Enemy defeated
            const goldReward = Math.floor((enemy.type.xp / 2) * difficulty.goldMult)
            onEnemyDefeated(enemy.type.xp * difficulty.xpMult, goldReward)
            
            if (enemy.type.isBoss) {
              incrementBossesDefeated()
            }
          }
          return { ...enemy, health: newHealth }
        }
        return enemy
      })
      
      if (changed) {
        setEnemies(updatedEnemies)
      }
    })

    return unsubscribe
  }, [onEnemyDefeated, difficulty.goldMult, difficulty.xpMult, incrementBossesDefeated])

  // Enemy AI update
  useFrame((_, delta) => {
    const playerPos = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z)

    enemiesRef.current.forEach((enemy) => {
      if (enemy.health <= 0) return

      const mesh = meshRefs.current.get(enemy.id)
      const healthBar = healthBarRefs.current.get(enemy.id)
      if (!mesh) return

      const distToPlayer = enemy.position.distanceTo(playerPos)

      // State machine with constants
      enemy.stateTimer -= delta

      if (distToPlayer < ENEMY.ATTACK_RANGE) {
        enemy.state = 'attacking'
      } else if (distToPlayer < ENEMY.DETECTION_RANGE) {
        enemy.state = 'chasing'
      } else if (enemy.stateTimer <= 0) {
        enemy.state = enemy.state === 'idle' ? 'wandering' : 'idle'
        // Use seeded RNG for deterministic behavior
        enemy.stateTimer = enemy.rng.nextRange(ENEMY.MIN_WANDER_TIME, ENEMY.MAX_WANDER_TIME)

        if (enemy.state === 'wandering') {
          // Pick seeded random wander target
          enemy.targetPosition.set(
            enemy.position.x + (enemy.rng.next() - 0.5) * ENEMY.WANDER_RANGE,
            enemy.position.y,
            enemy.position.z + (enemy.rng.next() - 0.5) * ENEMY.WANDER_RANGE
          )
        }
      }

      // Movement based on state
      const moveDir = new THREE.Vector3()

      if (enemy.state === 'chasing' || enemy.state === 'attacking') {
        moveDir.subVectors(playerPos, enemy.position).normalize()
      } else if (enemy.state === 'wandering') {
        moveDir.subVectors(enemy.targetPosition, enemy.position).normalize()
      }

      // Apply movement
      if (enemy.state !== 'idle') {
        const speed = enemy.state === 'attacking' ? 0 : enemy.type.speed
        enemy.position.x += moveDir.x * speed * delta
        enemy.position.z += moveDir.z * speed * delta

        // Clamp to bounds (use same as player)
        enemy.position.x = Math.max(-PLAYER.WORLD_BOUNDS, Math.min(PLAYER.WORLD_BOUNDS, enemy.position.x))
        enemy.position.z = Math.max(-PLAYER.WORLD_BOUNDS, Math.min(PLAYER.WORLD_BOUNDS, enemy.position.z))

        // Update Y to terrain
        const terrainY = heightFunction(enemy.position.x, enemy.position.z)
        enemy.position.y = Math.max(0.5, terrainY + 0.5)
      }

      // Attack player
      if (enemy.state === 'attacking') {
        const lastAttack = lastAttackRef.current.get(enemy.id) || 0
        const now = Date.now()
        if (now - lastAttack > ENEMY.ATTACK_COOLDOWN) {
          onPlayerDamage(enemy.type.damage * difficulty.damageMult)
          lastAttackRef.current.set(enemy.id, now)
        }
      }

      // Update mesh and health bar
      mesh.position.copy(enemy.position)
      if (moveDir.lengthSq() > 0) {
        mesh.rotation.y = Math.atan2(moveDir.x, moveDir.z)
      }
      
      if (healthBar) {
        healthBar.position.set(enemy.position.x, enemy.position.y + 0.8, enemy.position.z)
        const healthPercent = Math.max(0, enemy.health / enemy.maxHealth)
        healthBar.scale.x = healthPercent
      }
    })
  })

  return (
    <group>
      {enemies.map((enemy) => {
        if (enemy.health <= 0) return null

        return (
          <group key={enemy.id}>
            {/* Enemy body */}
            <mesh
              ref={(ref) => {
                if (ref) meshRefs.current.set(enemy.id, ref)
                else meshRefs.current.delete(enemy.id)
              }}
              position={enemy.position}
              castShadow
              scale={enemy.type.isBoss ? [2.5, 2.5, 2.5] : [1, 1, 1]}
            >
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial
                color={enemy.type.color}
                roughness={0.6}
                metalness={0.2}
              />
            </mesh>

            {/* Health bar */}
            <mesh
              ref={(ref) => {
                if (ref) healthBarRefs.current.set(enemy.id, ref)
                else healthBarRefs.current.delete(enemy.id)
              }}
              position={[enemy.position.x, enemy.position.y + 0.8, enemy.position.z]}
            >
              <planeGeometry args={[0.8, 0.1]} />
              <meshBasicMaterial
                color={enemy.health / enemy.maxHealth > 0.5 ? '#4CAF50' : enemy.health / enemy.maxHealth > 0.25 ? '#FF9800' : '#f44336'}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
