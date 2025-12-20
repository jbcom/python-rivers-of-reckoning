import { Canvas } from '@react-three/fiber'
import { Water, Terrain, Vegetation, Sky, Player, GameState, ProceduralAudio, Triggers } from '@jbcom/strata'

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
        
        {/* Strata's Procedural Audio System */}
        <ProceduralAudio
          ambient={{
            biome: true,      // Ambient sounds based on biome
            weather: true,    // Weather sounds (rain, wind, etc.)
            timeOfDay: true   // Day/night ambient changes
          }}
          effects={{
            footsteps: true,  // Player movement sounds
            water: true,      // Water splash/flow sounds
            vegetation: true  // Rustling leaves/grass
          }}
          music={{
            procedural: true, // Generative background music
            adaptive: true    // Changes with gameplay
          }}
        />
        
        {/* Strata Triggers - Game Events & Interactivity */}
        <Triggers
          spatial={{
            // Trigger events when player enters areas
            biomeTransition: {
              radius: 50,
              onEnter: (biome) => console.log(`Entered ${biome.name}`),
              effects: ['sound', 'visual']
            },
            enemyEncounter: {
              radius: 20,
              frequency: 0.1,  // 10% chance per area
              onTrigger: (enemy) => console.log(`Encountered ${enemy.type}`)
            },
            lootSpawn: {
              radius: 15,
              density: 0.05,   // Sparse loot
              types: ['gold', 'health', 'items']
            }
          }}
          temporal={{
            // Time-based events
            weatherChange: {
              interval: 300,   // Every 5 minutes
              conditions: ['weather', 'biome']
            },
            dayNightEvents: {
              dawn: () => console.log('Dawn breaks'),
              dusk: () => console.log('Night falls'),
              midnight: () => console.log('Midnight approaches')
            }
          }}
          conditional={{
            // Condition-based triggers
            lowHealth: {
              threshold: 25,
              onTrigger: () => console.log('Health critical!'),
              effects: ['warning-sound', 'screen-flash']
            },
            levelUp: {
              threshold: 'experience',
              onTrigger: (level) => console.log(`Level ${level}!`)
            }
          }}
          interactive={{
            // Player interaction triggers
            examine: {
              key: 'e',
              range: 5,
              objects: ['plants', 'rocks', 'water']
            },
            collect: {
              key: 'f',
              range: 3,
              items: true
            }
          }}
        />
      </GameState>
    </Canvas>
  )
}
