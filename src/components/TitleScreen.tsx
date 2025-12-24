/**
 * Title Screen - Ported from game.py draw_title()
 */

import { Typography, Button, Container, List, ListItem, ListItemIcon, ListItemText, ButtonGroup } from '@mui/material'
import { PlayArrow, Star, CloudDownload } from '@mui/icons-material'
import { useGameStore } from '../store/gameStore'
import { DIFFICULTY } from '../constants/game'
import { useState } from 'react'

export function TitleScreen() {
  const { startGame, loadGame } = useGameStore()
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTY>('NORMAL')

  const hasSave = !!localStorage.getItem('rivers_of_reckoning_save')

  // Core features from GAME_IDENTITY.md design pillars
  const features = [
    'Infinite procedural worlds from seeds',
    'Dynamic biomes: marsh, forest, desert, tundra',
    'Challenging enemy encounters & combat',
    'Weather & day/night affect gameplay',
    'Level up and grow stronger',
  ]

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        {/* Title */}
        <Typography
          variant="h2"
          sx={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            mb: 2,
            textShadow: '0 0 20px #4CAF50',
            color: '#4CAF50',
          }}
        >
          RIVERS OF
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            mb: 4,
            textShadow: '0 0 20px #2196F3',
            color: '#2196F3',
          }}
        >
          RECKONING
        </Typography>

        {/* Tagline - matches GAME_IDENTITY.md */}
        <Typography
          variant="h6"
          sx={{
            mb: 4,
            opacity: 0.8,
            fontStyle: 'italic',
          }}
        >
          Where every river leads to adventure
        </Typography>

        {/* Features */}
        <List sx={{ mb: 4, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
          {features.map((feature, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Star sx={{ color: '#FFD700', fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontFamily: 'Roboto Mono',
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* Difficulty Selection */}
        <div style={{ marginBottom: '24px' }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.7 }}>
            Select Difficulty
          </Typography>
          <ButtonGroup variant="outlined" size="small">
            {(Object.keys(DIFFICULTY) as Array<keyof typeof DIFFICULTY>).map((level) => (
              <Button
                key={level}
                onClick={() => setDifficulty(level)}
                sx={{
                  color: difficulty === level ? '#4CAF50' : 'white',
                  borderColor: difficulty === level ? '#4CAF50' : 'rgba(255,255,255,0.3)',
                  bgcolor: difficulty === level ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                }}
              >
                {DIFFICULTY[level].label}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* Start and Load Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={() => startGame(undefined, difficulty)}
            sx={{
              px: 4,
              py: 2,
              fontSize: '1rem',
              fontFamily: '"Press Start 2P", monospace',
              background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
              boxShadow: '0 0 20px rgba(76, 175, 80, 0.5)',
              '&:hover': {
                background: 'linear-gradient(45deg, #66BB6A 30%, #9CCC65 90%)',
                boxShadow: '0 0 30px rgba(76, 175, 80, 0.8)',
              },
            }}
          >
            START
          </Button>

          {hasSave && (
            <Button
              variant="outlined"
              size="large"
              startIcon={<CloudDownload />}
              onClick={() => loadGame()}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1rem',
                fontFamily: '"Press Start 2P", monospace',
                color: '#2196F3',
                borderColor: '#2196F3',
                '&:hover': {
                  borderColor: '#64B5F6',
                  bgcolor: 'rgba(33, 150, 243, 0.1)',
                },
              }}
            >
              LOAD
            </Button>
          )}
        </div>

        {/* Controls hint */}
        <Typography
          variant="body2"
          sx={{ mt: 4, opacity: 0.6 }}
        >
          WASD/Arrows to move • Space/Click to attack • ESC to pause
        </Typography>
      </Container>
    </div>
  )
}
