/**
 * Player Component - 3D player character with WASD movement
 * Ported from Python player.py
 */

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { PLAYER } from '../constants/game'

interface PlayerProps {
  heightFunction: (x: number, z: number) => number
}

export function Player({ heightFunction }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const velocityRef = useRef(new THREE.Vector3())
  const keysRef = useRef<Set<string>>(new Set())
  const joystickRef = useRef({ x: 0, y: 0 }) // Virtual joystick state

  const { playerPosition, movePlayer, playerHealth } = useGameStore()
  
  // Joystick dead zone constant
  const JOYSTICK_DEAD_ZONE = 0.1

  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }

    const handleJoystick = (e: any) => {
      if (e.detail) {
        joystickRef.current.x = e.detail.x || 0
        joystickRef.current.y = e.detail.y || 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('game:joystick', handleJoystick as EventListener)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('game:joystick', handleJoystick as EventListener)
    }
  }, [])

  // Movement and physics
  useFrame((_, delta) => {
    if (!meshRef.current) return

    const keys = keysRef.current
    const velocity = velocityRef.current

    // WASD movement
    let moveX = 0
    let moveZ = 0

    if (keys.has('w') || keys.has('arrowup')) moveZ -= 1
    if (keys.has('s') || keys.has('arrowdown')) moveZ += 1
    if (keys.has('a') || keys.has('arrowleft')) moveX -= 1
    if (keys.has('d') || keys.has('arrowright')) moveX += 1

    // Add joystick input with dead zone
    const joyX = Math.abs(joystickRef.current.x) > JOYSTICK_DEAD_ZONE ? joystickRef.current.x : 0
    const joyY = Math.abs(joystickRef.current.y) > JOYSTICK_DEAD_ZONE ? joystickRef.current.y : 0
    
    moveX += joyX
    moveZ += joyY

    // Normalize diagonal movement
    if (moveX !== 0 || moveZ !== 0) {
      const len = Math.sqrt(moveX * moveX + moveZ * moveZ)
      if (len > 1) { // Only normalize if combined input exceeds 1
        moveX /= len
        moveZ /= len
      }
    }

    // Apply movement
    velocity.x = moveX * PLAYER.SPEED
    velocity.z = moveZ * PLAYER.SPEED

    // Update position
    const newX = playerPosition.x + velocity.x * delta
    const newZ = playerPosition.z + velocity.z * delta

    // Clamp to world bounds
    const clampedX = Math.max(-PLAYER.WORLD_BOUNDS, Math.min(PLAYER.WORLD_BOUNDS, newX))
    const clampedZ = Math.max(-PLAYER.WORLD_BOUNDS, Math.min(PLAYER.WORLD_BOUNDS, newZ))

    // Get terrain height
    const terrainY = heightFunction(clampedX, clampedZ)
    const targetY = Math.max(0.5, terrainY + 0.5)

    // Only update if actually moved
    if (velocity.x !== 0 || velocity.z !== 0) {
      movePlayer(
        clampedX - playerPosition.x,
        targetY - playerPosition.y,
        clampedZ - playerPosition.z
      )
    }

    // Update mesh position
    meshRef.current.position.set(clampedX, targetY, clampedZ)

    // Rotate in movement direction
    if (velocity.x !== 0 || velocity.z !== 0) {
      meshRef.current.rotation.y = Math.atan2(velocity.x, velocity.z)
    }
  })

  // Player color based on health
  const healthPercent = playerHealth.current / playerHealth.maximum
  const playerColor = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#f44336'

  return (
    <group>
      {/* Player body */}
      <mesh
        ref={meshRef}
        position={[playerPosition.x, playerPosition.y + 0.5, playerPosition.z]}
        castShadow
      >
        <capsuleGeometry args={[0.3, 1, 8, 16]} />
        <meshStandardMaterial color={playerColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Player shadow indicator on ground */}
      <mesh
        position={[playerPosition.x, 0.01, playerPosition.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
