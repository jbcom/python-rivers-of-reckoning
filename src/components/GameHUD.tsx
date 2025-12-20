/**
 * Game HUD - Ported from game.py draw_enhanced_hud()
 */

import { Typography, LinearProgress, Chip, Stack } from '@mui/material'
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
import { useEffect } from 'react'

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
        <div style={{ width: 200 }}>
          {/* Health */}
          <div style={{ marginBottom: '8px' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Favorite sx={{ color: '#f44336', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: 'white', fontFamily: 'Roboto Mono' }}>
                {Math.ceil(playerHealth.current)} / {playerHealth.maximum}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={healthPercent}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: 'rgba(244, 67, 54, 0.2)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: healthPercent > 25 ? '#f44336' : '#ff0000',
                  transition: 'width 0.3s ease',
                },
              }}
            />
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
                height: 6,
                borderRadius: 1,
                bgcolor: 'rgba(255, 152, 0, 0.2)',
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
