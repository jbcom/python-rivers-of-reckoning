/**
 * Game HUD - Ported from game.py draw_enhanced_hud()
 */

import { Typography, LinearProgress, Chip, Stack, Box } from '@mui/material'
import {
  Favorite,
  LocalFireDepartment,
  Explore,
  WbSunny,
  Cloud,
  Thunderstorm,
  AcUnit,
  FilterDrama,
} from '@mui/icons-material'
import { useGameStore } from '../store/gameStore'
import { BIOME_CONFIGS, WeatherType } from '../types/game'
import { useEffect, useState, useRef, useCallback } from 'react'
import { audioManager } from '../utils/audioManager'

const WeatherIcon = ({ weather }: { weather: WeatherType }) => {
  switch (weather) {
    case WeatherType.CLEAR:
      return <WbSunny sx={{ color: '#FFD700' }} />
    case WeatherType.RAIN:
      return <Cloud sx={{ color: '#87CEEB' }} />
    case WeatherType.STORM:
      return <Thunderstorm sx={{ color: '#9370DB' }} />
    case WeatherType.SNOW:
      return <AcUnit sx={{ color: '#ADD8E6' }} />
    case WeatherType.FOG:
      return <FilterDrama sx={{ color: '#808080' }} />
    default:
      return <WbSunny sx={{ color: '#FFD700' }} />
  }
}

// Virtual Joystick for Mobile
const VirtualJoystick = () => {
  const [, setIsActive] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Use a ref to track active state for immediate response in handleMove during handleStart
  const isActiveRef = useRef(false)

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent, overrideActive: boolean = false) => {
    if ((!isActiveRef.current && !overrideActive) || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as React.MouseEvent).clientX
      clientY = (e as React.MouseEvent).clientY
    }
    
    const dx = clientX - centerX
    const dy = clientY - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = rect.width / 2
    
    // Fix division by zero and normalize correctly
    const moveX = dist > 0 ? (dx / maxDist) * Math.min(1, maxDist / dist) : 0
    const moveY = dist > 0 ? (dy / maxDist) * Math.min(1, maxDist / dist) : 0
    
    setPosition({ x: moveX * 30, y: moveY * 30 })
    
    // Dispatch custom event for player movement
    window.dispatchEvent(new CustomEvent('joystick-move', { 
      detail: { x: moveX, y: moveY } 
    }))
  }, [])

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    isActiveRef.current = true
    setIsActive(true)
    handleMove(e, true)
  }

  const handleEnd = () => {
    isActiveRef.current = false
    setIsActive(false)
    setPosition({ x: 0, y: 0 })
    window.dispatchEvent(new CustomEvent('joystick-move', { 
      detail: { x: 0, y: 0 } 
    }))
  }

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: '40px',
        left: '40px',
        width: '128px',
        height: '128px',
        backgroundImage: 'url(/assets/images/joystick_base.png)',
        backgroundSize: 'cover',
        pointerEvents: 'auto',
        zIndex: 1000,
        touchAction: 'none'
      }}
      onMouseDown={handleStart}
      onMouseMove={(e) => handleMove(e)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={(e) => handleMove(e)}
      onTouchEnd={handleEnd}
    >
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '64px',
          height: '64px',
          backgroundImage: 'url(/assets/images/joystick_knob.png)',
          backgroundSize: 'cover',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

export function GameHUD() {
  const {
    playerHealth,
    playerStamina,
    playerStats,
    playerPosition,
    timeOfDay,
    weather,
    worldState,
    pauseGame,
  } = useGameStore()

  const biomeConfig = BIOME_CONFIGS[worldState.currentBiome]
  const healthPercent = (playerHealth.current / playerHealth.maximum) * 100
  const staminaPercent = (playerStamina.current / playerStamina.maximum) * 100

  // Handle gold pickup sound
  const prevGoldRef = useRef(playerStats.gold)
  useEffect(() => {
    if (playerStats.gold > prevGoldRef.current) {
      audioManager.playPickup()
    }
    prevGoldRef.current = playerStats.gold
  }, [playerStats.gold])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        pauseGame()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pauseGame])

  return (
    <>
      <VirtualJoystick />
      
      {/* Top HUD Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '16px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        {/* Left: Health & Stamina */}
        <div style={{ width: 220 }}>
          {/* Health */}
          <div style={{ marginBottom: '12px' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Favorite sx={{ color: '#f44336', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: 'white', fontFamily: 'Roboto Mono', fontWeight: 'bold' }}>
                {Math.ceil(playerHealth.current)} / {playerHealth.maximum}
              </Typography>
            </Stack>
            <Box sx={{ 
              position: 'relative', 
              height: 24, 
              width: '100%',
              backgroundImage: 'url(/assets/images/ui_health_bg.png)',
              backgroundSize: '100% 100%',
              imageRendering: 'pixelated'
            }}>
              <Box sx={{ 
                position: 'absolute',
                top: '10%',
                left: '2%',
                height: '80%',
                width: `${healthPercent * 0.96}%`,
                backgroundImage: 'url(/assets/images/ui_health_fg.png)',
                backgroundSize: '100% 100%',
                imageRendering: 'pixelated',
                transition: 'width 0.3s ease'
              }} />
            </Box>
          </div>

          {/* Stamina */}
          <div>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <LocalFireDepartment sx={{ color: '#FF9800', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: 'white', fontFamily: 'Roboto Mono' }}>
                {Math.ceil(playerStamina.current)} / {playerStamina.maximum}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={staminaPercent}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: 'rgba(255, 152, 0, 0.2)',
                border: '1px solid rgba(255, 152, 0, 0.4)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#FF9800',
                },
              }}
            />
          </div>
        </div>

        {/* Center: Biome & Weather */}
        <Stack alignItems="center" spacing={1}>
          <Chip
            label={biomeConfig.name}
            size="small"
            sx={{
              bgcolor: biomeConfig.baseColor,
              color: 'white',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '0.6rem',
            }}
          />
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <WeatherIcon weather={weather.current} />
            <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
              {weather.current.charAt(0).toUpperCase() + weather.current.slice(1)}
            </Typography>
          </Stack>
        </Stack>

        {/* Right: Stats */}
        <div style={{ textAlign: 'right' }}>
          <Typography
            variant="body2"
            sx={{ color: '#FFD700', fontFamily: 'Roboto Mono', fontWeight: 'bold' }}
          >
            💰 {playerStats.gold}
          </Typography>
          <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
            Lv.{playerStats.level} • {playerStats.score} pts
          </Typography>
        </div>
      </div>

      {/* Bottom HUD Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '8px',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        {/* Coordinates */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Explore sx={{ color: '#888', fontSize: 14 }} />
          <Typography variant="caption" sx={{ color: '#888', fontFamily: 'Roboto Mono' }}>
            ({Math.floor(playerPosition.x)}, {Math.floor(playerPosition.z)})
          </Typography>
        </Stack>

        {/* Time */}
        <Typography variant="caption" sx={{ color: '#888', fontFamily: 'Roboto Mono' }}>
          Day {timeOfDay.dayCount} • {Math.floor(timeOfDay.hour).toString().padStart(2, '0')}:
          {Math.floor((timeOfDay.hour % 1) * 60).toString().padStart(2, '0')}
          {' '}{timeOfDay.phase}
        </Typography>

        {/* Distance */}
        <Typography variant="caption" sx={{ color: '#888', fontFamily: 'Roboto Mono' }}>
          🏃 {Math.floor(worldState.distanceTraveled)}m
        </Typography>
      </div>
    </>
  )
}
