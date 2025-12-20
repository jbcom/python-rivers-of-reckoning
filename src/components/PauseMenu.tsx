/**
 * Pause Menu - Ported from game.py draw_paused()
 */

import { Typography, Button, Container, Stack } from '@mui/material'
import { PlayArrow, Home, Settings } from '@mui/icons-material'
import { useGameStore } from '../store/gameStore'

export function PauseMenu() {
  const { resumeGame, resetGame } = useGameStore()

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
            PAUSED
          </Typography>

          {/* Menu Options */}
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
              startIcon={<Settings />}
              disabled
              sx={{
                py: 1.5,
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '0.7rem',
                borderColor: '#666',
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
