import React, { useEffect, useRef, useState } from 'react'
import nipplejs from 'nipplejs'
import { useGameStore } from '../store/gameStore'

interface VirtualJoystickProps {
  size?: number
  position?: { bottom: string | number; left?: string | number; right?: string | number }
  color?: string
  type?: 'move' | 'look'
}

/**
 * VirtualJoystick component with haptic feedback and multi-touch support.
 * Uses nipplejs for joystick logic and Zustand for state management.
 */
export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  size = 120,
  position = { bottom: '40px', left: '40px' },
  color = 'white',
  type = 'move',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const managerRef = useRef<nipplejs.JoystickManager | null>(null)
  const { setJoystickInput, setLookInput, isTouchDevice, setIsTouchDevice } = useGameStore()
  
  // Local visibility state to handle transitions smoothly
  const [shouldRender, setShouldRender] = useState(isTouchDevice)

  // Use refs for the store setters to ensure the nipplejs callbacks are stable
  // and don't trigger re-creation of the joystick manager unnecessarily.
  const setInputRef = useRef(type === 'move' ? setJoystickInput : setLookInput)
  
  useEffect(() => {
    setInputRef.current = type === 'move' ? setJoystickInput : setLookInput
  }, [type, setJoystickInput, setLookInput])

  // Update local shouldRender when store isTouchDevice changes
  useEffect(() => {
    setShouldRender(isTouchDevice)
  }, [isTouchDevice])

  // Detect touch support and keyboard usage dynamically
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // List of movement keys that suggest keyboard use
      const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
      if (movementKeys.includes(e.key.toLowerCase())) {
        setIsTouchDevice(false)
      }
    }

    const handleTouchStart = () => {
      setIsTouchDevice(true)
    }

    // Initial check
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      setIsTouchDevice(true)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [setIsTouchDevice])

  // Initialize and manage nipplejs instance
  useEffect(() => {
    if (!containerRef.current || !shouldRender) {
      if (managerRef.current) {
        managerRef.current.destroy()
        managerRef.current = null
      }
      return
    }

    // mode: 'static' is better for production as it doesn't jump around
    const manager = nipplejs.create({
      zone: containerRef.current,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: color,
      size: size,
      restOpacity: 0.5,
      catchDistance: 150,
    })

    managerRef.current = manager

    manager.on('move', (_, data) => {
      if (data.vector) {
        setInputRef.current({
          x: data.vector.x,
          y: type === 'move' ? -data.vector.y : data.vector.y, // Inverse Y only for moveZ
        })
      }
    })

    manager.on('start', () => {
      // Haptic feedback on start
      if ('vibrate' in navigator) {
        navigator.vibrate(15)
      }
    })

    manager.on('end', () => {
      setInputRef.current({ x: 0, y: 0 })
      // Haptic feedback on end
      if ('vibrate' in navigator) {
        navigator.vibrate(5)
      }
    })

    return () => {
      manager.destroy()
      managerRef.current = null
      // Ensure we clear input on unmount
      setInputRef.current({ x: 0, y: 0 })
    }
  }, [shouldRender, color, size, type])

  if (!shouldRender) return null

  return (
    <div
      ref={containerRef}
      className={`virtual-joystick-${type}`}
      style={{
        position: 'fixed',
        bottom: position.bottom,
        left: position.left,
        right: position.right,
        width: size,
        height: size,
        zIndex: 1000,
        touchAction: 'none',
        pointerEvents: 'auto',
        transition: 'opacity 0.3s ease-in-out',
      }}
    />
  )
}
