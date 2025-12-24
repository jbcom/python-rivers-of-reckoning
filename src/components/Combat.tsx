/**
 * Combat System - Attack mechanics and damage indicators
 * Ported from Python combat logic in game.py
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { PLAYER } from '../constants/game'
import { combatEvents } from '../events/combatEvents'

interface DamageIndicator {
  id: number
  position: THREE.Vector3
  damage: number
  time: number
}

interface CombatSystemProps {
  playerPosition: { x: number; y: number; z: number }
}

// Seeded random for deterministic visual effects
class VisualRandom {
  private seed: number
  constructor(seed: number) { this.seed = seed }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
}

export function CombatSystem({ playerPosition }: CombatSystemProps) {
  const [indicators, setIndicators] = useState<DamageIndicator[]>([])
  const [isAttacking, setIsAttacking] = useState(false)
  const attackCooldownRef = useRef(0)
  const idCounterRef = useRef(0)
  const visualRngRef = useRef<VisualRandom>(null!)

  useEffect(() => {
    if (!visualRngRef.current) {
      visualRngRef.current = new VisualRandom(12345) // Fixed seed for visual effects
    }
  }, [])

  const { playerStats } = useGameStore()

  // Calculate attack damage
  const getAttackDamage = useCallback(() => {
    return PLAYER.BASE_DAMAGE + playerStats.level * PLAYER.DAMAGE_PER_LEVEL
  }, [playerStats.level])

  // Perform attack - emit event to enemy system
  const performAttack = useCallback(() => {
    setIsAttacking(true)
    const damage = getAttackDamage()

    // Emit attack event - enemy system will check for hits
    combatEvents.emitPlayerAttack(
      playerPosition,
      PLAYER.ATTACK_RANGE,
      damage
    )

    // Show attack indicator with seeded position offset
    const offsetX = (visualRngRef.current.next() - 0.5) * 2
    const offsetZ = (visualRngRef.current.next() - 0.5) * 2

    const newIndicator: DamageIndicator = {
      id: idCounterRef.current++,
      position: new THREE.Vector3(
        playerPosition.x + offsetX,
        playerPosition.y + 1.5,
        playerPosition.z + offsetZ
      ),
      damage,
      time: 0,
    }

    setIndicators((prev) => [...prev, newIndicator])
  }, [playerPosition, getAttackDamage])

  // Attack input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && attackCooldownRef.current <= 0) {
        performAttack()
        attackCooldownRef.current = PLAYER.ATTACK_COOLDOWN
      }
    }

    const handleClick = (e: MouseEvent) => {
      // Ignore clicks on UI elements
      if ((e.target as HTMLElement).closest('button, .MuiButton-root')) return
      
      if (attackCooldownRef.current <= 0) {
        performAttack()
        attackCooldownRef.current = PLAYER.ATTACK_COOLDOWN
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleClick)
    }
  }, [performAttack])

  // Update cooldown and indicators
  useFrame((_, delta) => {
    if (attackCooldownRef.current > 0) {
      attackCooldownRef.current -= delta
      if (attackCooldownRef.current <= 0) {
        setIsAttacking(false)
      }
    }

    // Update indicators - only update when there are indicators
    setIndicators((prev) => {
      if (prev.length === 0) return prev
      return prev
        .map((ind) => ({ ...ind, time: ind.time + delta }))
        .filter((ind) => ind.time < 1) // Remove after 1 second
    })
  })

  return (
    <group>
      {/* Attack range indicator when attacking */}
      {isAttacking && (
        <mesh
          position={[playerPosition.x, 0.02, playerPosition.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[PLAYER.ATTACK_RANGE - 0.2, PLAYER.ATTACK_RANGE, 32]} />
          <meshBasicMaterial color="#f44336" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Damage indicators */}
      {indicators.map((ind) => (
        <sprite
          key={ind.id}
          position={[
            ind.position.x,
            ind.position.y + ind.time * 2, // Float upward
            ind.position.z,
          ]}
          scale={[1 - ind.time * 0.5, 1 - ind.time * 0.5, 1]}
        >
          <spriteMaterial
            color="#FFD700"
            transparent
            opacity={1 - ind.time}
          />
        </sprite>
      ))}
    </group>
  )
}
