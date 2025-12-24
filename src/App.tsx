/**
 * Rivers of Reckoning - Main Game Component
 *
 * A procedural 3D RPG using @jbcom/strata for terrain, water, vegetation,
 * weather, audio, AI, state management, and game systems.
 *
 * This is the FULL implementation using real Strata APIs.
 * All Python functionality has been ported to TypeScript.
 */

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stats, Loader } from '@react-three/drei'
import { Suspense, useMemo, useRef, useCallback } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import * as THREE from 'three'

// Strata imports - using REAL API only
import {
  // Core algorithms - fbm(x, y, z, octaves?)
  fbm,
  
  // React Vegetation Components
  GrassInstances,
  TreeInstances,
  RockInstances,

  // React Components
  ProceduralSky,
  Rain,
  Snow,

  // Post-processing
  CinematicEffects,
} from '@jbcom/strata'

// Local components
import { TitleScreen, GameHUD, PauseMenu, GameOverScreen, Player, EnemySystem, CombatSystem } from './components'
import { useGameStore } from './store/gameStore'
import { WeatherType } from './types/game'

// =============================================================================
// HEIGHT FUNCTION (shared for terrain, player, enemies)
// =============================================================================

function getTerrainHeight(x: number, z: number): number {
  const baseHeight = fbm(x * 0.02, 0, z * 0.02, 6) * 8
  const largeScale = fbm(x * 0.008, 0.1, z * 0.008, 4) * 12
  return Math.max(0, baseHeight + largeScale)
}

// =============================================================================
// THEME
// =============================================================================

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4CAF50' },
    secondary: { main: '#2196F3' },
    background: { default: '#121212', paper: '#1e1e1e' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

// =============================================================================
// SEEDED RANDOM (for deterministic generation)
// =============================================================================

class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
}

// =============================================================================
// PROCEDURAL TERRAIN (using Strata's fbm)
// =============================================================================

interface ProceduralTerrainProps {
  size: number
  segments: number
  seed: number
}

function ProceduralTerrain({ size, segments, seed }: ProceduralTerrainProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    geo.rotateX(-Math.PI / 2)

    const positions = geo.attributes.position
    const colors = new Float32Array(positions.count * 3)

    // Use a local RNG for deterministic generation
    const localRng = new SeededRandom(seed)

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)

      // Multi-layer terrain using Strata's fbm(x, y, z, octaves)
      // Using y=0 since we're generating 2D heightmap
      const baseHeight = fbm(x * 0.02, 0, z * 0.02, 6) * 8
      const largeScale = fbm(x * 0.008, 0.1, z * 0.008, 4) * 12
      const detail = fbm(x * 0.1, 0.2, z * 0.1, 2) * 1.5

      // River valley with seeded variation
      const riverOffset = localRng.next() * 0.01
      const riverDist = Math.abs(z - 10 + Math.sin(x * 0.05 + riverOffset) * 15)
      const riverCarve = Math.max(0, 1 - riverDist / 20) * -4

      let height = baseHeight + largeScale + detail + riverCarve
      height = Math.max(-0.5, height)

      positions.setY(i, height)

      // Biome-based coloring using noise
      const biomeVal = fbm(x * 0.03, 0.5, z * 0.03, 3)
      const moisture = fbm(x * 0.05, 0.7, z * 0.05, 2)

      const color = new THREE.Color()
      if (height < 0) color.setHex(0xd4c5a3)           // Sand/riverbed
      else if (height < 2 && moisture > 0.3) color.setHex(0x4a6a3a)  // Marsh
      else if (biomeVal > 0.6) color.setHex(0x7a7a6a)  // Rocky
      else if (biomeVal > 0.3) color.setHex(0x2a4a2a)  // Forest
      else if (height > 10) color.setHex(0x8a9a8a)     // Mountain
      else color.setHex(0x3a5a2a)                      // Grassland

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [size, segments, seed])

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0.05} />
    </mesh>
  )
}

// =============================================================================
// VEGETATION SYSTEM (using Strata components)
// =============================================================================

function Vegetation({ areaSize }: { areaSize: number }) {
  // Height function for placing vegetation
  const heightFunc = useCallback(
    (x: number, z: number) => {
      const height =
        fbm(x * 0.02, 0, z * 0.02, 6) * 8 +
        fbm(x * 0.008, 0.1, z * 0.008, 4) * 12
      return Math.max(0, height)
    },
    []
  )

  return (
    <>
      <GrassInstances
        count={3000}
        areaSize={areaSize}
        heightFunc={heightFunc}
        height={0.3}
        color="#4a7a4a"
      />
      <TreeInstances
        count={150}
        areaSize={areaSize}
        heightFunc={heightFunc}
      />
      <RockInstances
        count={80}
        areaSize={areaSize}
        heightFunc={heightFunc}
      />
    </>
  )
}

// =============================================================================
// WATER SYSTEM
// =============================================================================

function WaterPlane({ size }: { size: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const { uniforms, vertexShader, fragmentShader } = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x1a5f7a) },
      uOpacity: { value: 0.85 },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float wave1 = sin(pos.x * 0.5 + uTime) * 0.3;
        float wave2 = sin(pos.z * 0.3 + uTime * 0.7) * 0.2;
        pos.y += wave1 + wave2;
        vPosition = pos;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vPosition);
        float fresnel = pow(1.0 - max(dot(viewDir, vec3(0.0, 1.0, 0.0)), 0.0), 2.0);
        float caustic = sin(vUv.x * 20.0 + uTime) * sin(vUv.y * 20.0 + uTime * 0.8) * 0.1;
        vec3 finalColor = uColor + vec3(fresnel * 0.3) + vec3(caustic);
        gl_FragColor = vec4(finalColor, uOpacity);
      }
    `,
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[size, size, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// =============================================================================
// WEATHER EFFECTS
// =============================================================================

function WeatherEffects({ weather, intensity }: { weather: WeatherType; intensity: number }) {
  if (weather === WeatherType.RAIN || weather === WeatherType.STORM) {
    return <Rain intensity={intensity} />
  }
  if (weather === WeatherType.SNOW) {
    return <Snow intensity={intensity} />
  }
  return null
}

// =============================================================================
// GAME LOOP (using requestAnimationFrame via useFrame)
// =============================================================================

function GameLoop() {
  const { updateTime, updateWeather } = useGameStore()

  useFrame((_, deltaTime) => {
    updateTime(deltaTime)
    updateWeather(deltaTime)
  })

  return null
}

// =============================================================================
// MAIN 3D SCENE
// =============================================================================

function Scene() {
  const {
    timeOfDay,
    weather,
    worldState,
    playerPosition,
    damagePlayer,
    addExperience,
    addGold,
    incrementEnemiesDefeated,
  } = useGameStore()

  // Callbacks for enemy system
  const handleEnemyDefeated = (xp: number, gold: number) => {
    addExperience(xp)
    addGold(gold)
    incrementEnemiesDefeated()
  }

  const handlePlayerDamage = (damage: number) => {
    damagePlayer(damage)
  }

  // Calculate sun angle from time of day
  const sunAngle = useMemo(() => {
    const angle = ((timeOfDay.hour - 6) / 12) * 180
    return Math.max(0, Math.min(180, angle))
  }, [timeOfDay.hour])

  // Ambient light based on time
  const ambientIntensity = useMemo(() => {
    return timeOfDay.hour >= 6 && timeOfDay.hour <= 18 ? 0.8 : 0.15
  }, [timeOfDay.hour])

  // Sun intensity based on time
  const sunIntensity = useMemo(() => {
    return timeOfDay.hour >= 6 && timeOfDay.hour <= 18 ? 1.0 : 0.0
  }, [timeOfDay.hour])

  return (
    <>
      <GameLoop />

      {/* Lighting */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={sunIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />

      {/* Procedural sky */}
      <ProceduralSky
        timeOfDay={{
          sunAngle,
          sunIntensity,
          ambientLight: ambientIntensity,
          starVisibility: timeOfDay.hour < 6 || timeOfDay.hour > 18 ? 1.0 : 0.0,
          fogDensity: weather.current === WeatherType.FOG ? 0.5 : 0,
        }}
        weather={{
          intensity: weather.current !== WeatherType.CLEAR ? weather.intensity : 0,
        }}
        size={[300, 150]}
        distance={100}
      />

      {/* Weather effects */}
      <WeatherEffects weather={weather.current} intensity={weather.intensity} />

      {/* Terrain */}
      <ProceduralTerrain size={200} segments={256} seed={worldState.seed} />

      {/* Water */}
      <WaterPlane size={200} />

      {/* Vegetation */}
      <Vegetation areaSize={100} />

      {/* Player character */}
      <Player heightFunction={getTerrainHeight} />

      {/* Enemy system */}
      <EnemySystem
        seed={worldState.seed}
        playerPosition={playerPosition}
        heightFunction={getTerrainHeight}
        onEnemyDefeated={handleEnemyDefeated}
        onPlayerDamage={handlePlayerDamage}
      />

      {/* Combat system */}
      <CombatSystem playerPosition={playerPosition} />

      {/* Camera controls - follows player */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={50}
        target={[playerPosition.x, playerPosition.y, playerPosition.z]}
      />

      {/* Post-processing */}
      <CinematicEffects
        bloomIntensity={0.8}
        vignetteDarkness={0.3}
        chromaticAberration={0.002}
        filmGrain={false}
      />

      {/* Dev stats - shown in development mode */}
      <Stats />
    </>
  )
}

// =============================================================================
// MAIN APP
// =============================================================================

export default function App() {
  const { gameState } = useGameStore()

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      
      {/* Title Screen */}
      {gameState === 'title' && <TitleScreen />}
      
      {/* Game Over Screen */}
      {gameState === 'gameover' && <GameOverScreen />}
      
      {/* Main Game */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
          {/* HUD Overlay */}
          <GameHUD />
          
          {/* Pause Menu */}
          {gameState === 'paused' && <PauseMenu />}
          
          {/* 3D Canvas */}
          <Canvas
            shadows
            camera={{ position: [40, 30, 40], fov: 60 }}
            style={{ background: 'linear-gradient(to bottom, #1a1a2e, #16213e)' }}
          >
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Loading indicator for all assets */}
      <Loader 
        containerStyles={{ background: '#121212' }}
        innerStyles={{ width: '300px', height: '10px' }}
        barStyles={{ background: '#4CAF50' }}
        dataInterpolation={(p) => `Loading World: ${p.toFixed(0)}%`}
      />
    </ThemeProvider>
  )
}
