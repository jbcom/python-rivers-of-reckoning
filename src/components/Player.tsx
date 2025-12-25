/* eslint-disable react/no-unknown-property */
/**
 * Player Component - 3D player character with WASD movement
 * Ported from Python player.py
 */

import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { PLAYER } from '../constants/game'
import { audioManager } from '../utils/audioManager'

interface PlayerProps {
  heightFunction: (x: number, z: number) => number
}

export function Player({ heightFunction }: PlayerProps) {
  const meshRef = useRef<THREE.Group>(null)
  const spriteRef = useRef<THREE.Sprite>(null)
  const velocityRef = useRef(new THREE.Vector3())
  const keysRef = useRef<Set<string>>(new Set())
  const joystickRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef(0)
  const animationTimerRef = useRef(0)

  const { playerPosition, movePlayer, playerHealth } = useGameStore()
  
  // Joystick dead zone constant
  const JOYSTICK_DEAD_ZONE = 0.1

  // Load player spritesheet
  const texture = useTexture('/assets/images/player_spritesheet.png')
  
  // Clone texture for this instance and configure for animation
  const spriteTexture = useMemo(() => {
    const tex = texture.clone()
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(1/4, 1) // 4 frames
    tex.magFilter = THREE.NearestFilter // Pixel art look
    tex.minFilter = THREE.NearestFilter
    tex.needsUpdate = true
    return tex
  }, [texture])

  // Keyboard and Joystick input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }
    const handleJoystickMove = (e: CustomEvent<{ x: number; y: number }>) => {
      joystickRef.current = e.detail
    }

    const handleJoystick = (e: CustomEvent<{ x: number; y: number }>) => {
      if (e.detail) {
        joystickRef.current.x = e.detail.x || 0
        joystickRef.current.y = e.detail.y || 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('joystick-move', handleJoystickMove as EventListener)
    window.addEventListener('game:joystick', handleJoystick as EventListener)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('joystick-move', handleJoystickMove as EventListener)
      window.removeEventListener('game:joystick', handleJoystick as EventListener)
    }
  }, [])

  // Movement and physics
  useFrame((_state, delta) => {
    if (!meshRef.current || !spriteRef.current) return

    const keys = keysRef.current
    const velocity = velocityRef.current

    // Movement input (WASD)
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

    // Normalize input
    const inputLen = Math.sqrt(moveX * moveX + moveZ * moveZ)
    if (inputLen > 1) {
      moveX /= inputLen
      moveZ /= inputLen
    }

    // Apply movement
    velocity.x = moveX * PLAYER.SPEED
    velocity.z = moveZ * PLAYER.SPEED

    const isMoving = velocity.x !== 0 || velocity.z !== 0

    // Update animation
    if (isMoving) {
      animationTimerRef.current += delta * 10
      animationFrameRef.current = Math.floor(animationTimerRef.current) % 4
      // eslint-disable-next-line react-hooks/immutability
      spriteTexture.offset.x = animationFrameRef.current / 4

      // Play move sound occasionally - Performance fix to avoid audio spam
      const soundTrigger = Math.floor(animationTimerRef.current * 2) % 4
      if (soundTrigger === 0 && animationFrameRef.current === 1) {
        audioManager.playMove()
      }
    } else {
      spriteTexture.offset.x = 0 // Standing frame
      animationTimerRef.current = 0
    }

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
    if (isMoving) {
      movePlayer(
        clampedX - playerPosition.x,
        targetY - playerPosition.y,
        clampedZ - playerPosition.z
      )
    }

    // Update group position
    meshRef.current.position.set(clampedX, targetY, clampedZ)
  })

  // Player health color (we can still use it by tinting the sprite)
  const healthPercent = playerHealth.current / playerHealth.maximum
  const playerColor = healthPercent > 0.5 ? '#ffffff' : healthPercent > 0.25 ? '#FF9800' : '#f44336'

  return (
    <group ref={meshRef}>
      {/* Player Sprite */}
      <sprite ref={spriteRef} scale={[1.2, 1.2, 1]}>
        <spriteMaterial 
          map={spriteTexture} 
          color={playerColor} 
          transparent 
          alphaTest={0.5}
        />
      </sprite>

      {/* Player shadow indicator on ground */}
      <mesh
        position={[0, -0.49, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
