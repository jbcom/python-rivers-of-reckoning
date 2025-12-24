/**
 * Pause Menu - Ported from game.py draw_paused()
 */

import React from 'react'
import { Typography, Button, Container, Stack, FormControlLabel, Switch, Divider } from '@mui/material'
import { PlayArrow, Home, Settings as SettingsIcon } from '@mui/icons-material'
import { useGameStore } from '../store/gameStore'
import { DifficultyLevel } from '../types/game'

export function PauseMenu() {
  const { resumeGame, resetGame, settings, toggleFeature, worldState, setDifficultyLevel } = useGameStore()
  const [showSettings, setShowSettings] = React.useState(false)

  const handleDifficultyChange = () => {
    const levels = Object.values(DifficultyLevel)
    const currentIndex = levels.indexOf(worldState.difficultyLevel)
    const nextIndex = (currentIndex + 1) % levels.length
    setDifficultyLevel(levels[nextIndex])
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
      }}
    >
      <Container maxWidth="xs">
        <div
          style={{
            background: 'linear-gradient(180deg, #1e1e1e 0%, #2d2d2d 100%)',
            borderRadius: '8px',
            padding: '32px',
            border: '2px solid #4CAF50',
            boxShadow: '0 0 30px rgba(76, 175, 80, 0.3)',
            textAlign: 'center',
          }}
        >
          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '1.5rem',
              mb: 4,
              color: '#4CAF50',
            }}
          >
            {showSettings ? 'SETTINGS' : 'PAUSED'}
          </Typography>

          {!showSettings ? (
            /* Main Menu Options */
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<PlayArrow />}
                onClick={() => resumeGame()}
                sx={{
                  py: 1.5,
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.7rem',
                  background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                }}
              >
                RESUME
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<SettingsIcon />}
                onClick={() => setShowSettings(true)}
                sx={{
                  py: 1.5,
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.7rem',
                  borderColor: '#4CAF50',
                  color: '#4CAF50',
                }}
              >
                SETTINGS
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<Home />}
                onClick={() => resetGame()}
                sx={{
                  py: 1.5,
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.7rem',
                  borderColor: '#f44336',
                  color: '#f44336',
                  '&:hover': {
                    borderColor: '#ff5252',
                    background: 'rgba(244, 67, 54, 0.1)',
                  },
                }}
              >
                QUIT TO MENU
              </Button>
            </Stack>
          ) : (
            /* Settings View */
            <Stack spacing={1} textAlign="left">
              <Button 
                variant="contained" 
                size="small" 
                onClick={handleDifficultyChange}
                sx={{ mb: 2, fontFamily: 'Roboto Mono' }}
              >
                Difficulty: {worldState.difficultyLevel.toUpperCase()}
              </Button>

              <Divider sx={{ my: 1 }} />

              <FormControlLabel
                control={<Switch checked={settings.features.weather} onChange={() => toggleFeature('weather')} color="primary" />}
                label={<Typography sx={{ fontSize: '0.8rem', color: 'white' }}>Weather System</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={settings.features.randomEvents} onChange={() => toggleFeature('randomEvents')} color="primary" />}
                label={<Typography sx={{ fontSize: '0.8rem', color: 'white' }}>Random Events</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={settings.features.quests} onChange={() => toggleFeature('quests')} color="primary" />}
                label={<Typography sx={{ fontSize: '0.8rem', color: 'white' }}>Quest System</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={settings.features.particles} onChange={() => toggleFeature('particles')} color="primary" />}
                label={<Typography sx={{ fontSize: '0.8rem', color: 'white' }}>Particle Effects</Typography>}
              />
              
              <Button
                variant="text"
                fullWidth
                onClick={() => setShowSettings(false)}
                sx={{ mt: 2, color: '#4CAF50' }}
              >
                BACK
              </Button>
            </Stack>
          )}

          {/* Hint */}
          <Typography
            variant="body2"
            sx={{ mt: 3, opacity: 0.5, fontSize: '0.7rem' }}
          >
            Press ESC to resume
          </Typography>
        </div>
      </Container>
    </div>
  )
}
