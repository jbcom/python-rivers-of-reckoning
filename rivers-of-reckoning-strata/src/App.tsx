import { Canvas } from '@react-three/fiber'
import { Water, Terrain, Vegetation, Sky, Player, GameState } from '@jbcom/strata'

export default function App() {
  return (
    <Canvas camera={{ position: [0, 50, 100], fov: 60 }}>
      {/* Strata handles EVERYTHING */}
      <GameState
        biomes={[
          { name: 'Marsh', temperature: 0.5, moisture: 0.8 },
          { name: 'Forest', temperature: 0.5, moisture: 0.6 },
          { name: 'Desert', temperature: 0.9, moisture: 0.2 },
          { name: 'Tundra', temperature: 0.1, moisture: 0.5 },
          { name: 'Grassland', temperature: 0.6, moisture: 0.4 },
        ]}
        initialBiome="Grassland"
        weather="dynamic"
      >
        <Sky timeOfDay="dynamic" />
        <Terrain size={1000} resolution={128} />
        <Water size={1000} />
        <Vegetation count={8000} />
        <Player 
          health={100}
          position={[0, 0, 0]}
          controls="orbit"
        />
      </GameState>
    </Canvas>
  )
}
