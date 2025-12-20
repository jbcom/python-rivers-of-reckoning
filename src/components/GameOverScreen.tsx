/**
 * Game Over Screen - Ported from game.py draw_gameover()
 */

import { Typography, Button, Container, Grid } from '@mui/material'
import { Replay, Home } from '@mui/icons-material'
import { useGameStore } from '../store/gameStore'

export function GameOverScreen() {
  const { startGame, resetGame, playerStats, worldState } = useGameStore()

  const stats = [
    { label: 'Distance', value: Math.floor(worldState.distanceTraveled) },
    { label: 'Enemies', value: worldState.enemiesDefeated },
    { label: 'Bosses', value: worldState.bossesDefeated },
    { label: 'Gold', value: playerStats.gold },
    { label: 'Level', value: playerStats.level },
    { label: 'Score', value: playerStats.score },
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
        background: 'linear-gradient(180deg, #1a0a0a 0%, #2d1a1a 50%, #1a0a0a 100%)',
        color: 'white',
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        {/* Game Over Title */}
        <Typography
          variant="h2"
          sx={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: { xs: '2rem', sm: '3rem' },
            mb: 4,
            color: '#f44336',
            textShadow: '0 0 20px #f44336',
          }}
        >
          GAME OVER
        </Typography>

        {/* Stats Grid */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px',
            border: '2px solid #333',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: '#888' }}>
            FINAL STATS
          </Typography>
          <Grid container spacing={2}>
            {stats.map((stat) => (
              <Grid item key={stat.label} xs={6}>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#888', fontSize: '0.7rem' }}>
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: '"Press Start 2P", monospace',
                      color: '#4CAF50',
                    }}
                  >
                    {stat.value.toLocaleString()}
                  </Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Replay />}
            onClick={() => startGame()}
            sx={{
              px: 4,
              py: 1.5,
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '0.8rem',
              background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
            }}
          >
            NEW WORLD
          </Button>
          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={() => resetGame()}
            sx={{
              px: 4,
              py: 1.5,
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '0.8rem',
              borderColor: '#666',
              color: '#888',
            }}
          >
            MAIN MENU
          </Button>
        </div>
      </Container>
    </div>
  )
}
