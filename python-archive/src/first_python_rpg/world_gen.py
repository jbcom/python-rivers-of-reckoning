"""Procedural world generation using OpenSimplex noise.

Inspired by Otterfall's SDF-based terrain and biome systems.
Uses noise functions to generate coherent, natural-looking worlds.
"""

from dataclasses import dataclass
from enum import Enum, auto
from typing import Tuple, List
from opensimplex import OpenSimplex

# Initialize noise generators with different seeds for variety
TERRAIN_NOISE = OpenSimplex(seed=42)
MOISTURE_NOISE = OpenSimplex(seed=137)
TEMPERATURE_NOISE = OpenSimplex(seed=256)
CAVE_NOISE = OpenSimplex(seed=789)


class BiomeType(Enum):
    """Biome types determined by temperature and moisture."""
    MARSH = auto()      # High moisture, moderate temp
    FOREST = auto()     # Moderate moisture, moderate temp
    DESERT = auto()     # Low moisture, high temp
    TUNDRA = auto()     # Any moisture, low temp
    CAVES = auto()      # Underground (special)
    GRASSLAND = auto()  # Low moisture, moderate temp


class TileType(Enum):
    """Tile types for the map."""
    DIRT = "."
    GRASS = "^"
    SAND = "~"
    STONE = "#"
    WATER = "o"
    TREE = "T"
    ROCK = "R"
    CAVE_FLOOR = "_"
    CAVE_WALL = "X"


@dataclass
class BiomeConfig:
    """Configuration for a biome's characteristics."""
    name: str
    base_color: int
    accent_color: int
    tree_density: float      # 0-1 chance of tree per valid tile
    rock_density: float      # 0-1 chance of rock per valid tile
    water_density: float     # 0-1 chance of water per valid tile
    enemy_spawn_rate: float  # 0-1 base spawn rate
    stamina_modifier: float  # Multiplier for stamina drain
    visibility: float        # 0-1 how far player can see


# Biome configurations inspired by Otterfall
BIOME_CONFIGS = {
    BiomeType.MARSH: BiomeConfig(
        name="Marsh",
        base_color=4,    # Brown
        accent_color=11,  # Light green
        tree_density=0.1,
        rock_density=0.05,
        water_density=0.3,
        enemy_spawn_rate=0.3,
        stamina_modifier=1.1,
        visibility=0.7
    ),
    BiomeType.FOREST: BiomeConfig(
        name="Forest",
        base_color=3,    # Dark green
        accent_color=11,  # Light green
        tree_density=0.35,
        rock_density=0.1,
        water_density=0.05,
        enemy_spawn_rate=0.4,
        stamina_modifier=1.0,
        visibility=0.5
    ),
    BiomeType.DESERT: BiomeConfig(
        name="Desert",
        base_color=10,   # Yellow/sand
        accent_color=9,   # Orange
        tree_density=0.02,
        rock_density=0.15,
        water_density=0.01,
        enemy_spawn_rate=0.2,
        stamina_modifier=1.5,
        visibility=1.0
    ),
    BiomeType.TUNDRA: BiomeConfig(
        name="Tundra",
        base_color=7,    # White
        accent_color=12,  # Blue
        tree_density=0.05,
        rock_density=0.2,
        water_density=0.1,
        enemy_spawn_rate=0.25,
        stamina_modifier=1.3,
        visibility=0.8
    ),
    BiomeType.GRASSLAND: BiomeConfig(
        name="Grassland",
        base_color=3,    # Green
        accent_color=10,  # Yellow
        tree_density=0.08,
        rock_density=0.05,
        water_density=0.02,
        enemy_spawn_rate=0.35,
        stamina_modifier=0.9,
        visibility=0.9
    ),
    BiomeType.CAVES: BiomeConfig(
        name="Caves",
        base_color=5,    # Dark gray
        accent_color=13,  # Purple/indigo
        tree_density=0.0,
        rock_density=0.25,
        water_density=0.1,
        enemy_spawn_rate=0.5,
        stamina_modifier=1.0,
        visibility=0.3
    ),
}


def fbm(noise: OpenSimplex, x: float, y: float, octaves: int = 4, persistence: float = 0.5) -> float:
    """Fractal Brownian Motion - layered noise for natural-looking terrain.

    Args:
        noise: OpenSimplex noise generator
        x: X coordinate
        y: Y coordinate
        octaves: Number of noise layers
        persistence: Amplitude decay per octave

    Returns:
        Noise value in range approximately [-1, 1]
    """
    value = 0.0
    amplitude = 1.0
    frequency = 1.0
    max_value = 0.0

    for _ in range(octaves):
        value += amplitude * noise.noise2(x * frequency, y * frequency)
        max_value += amplitude
        amplitude *= persistence
        frequency *= 2.0

    return value / max_value


def get_terrain_value(x: int, y: int, scale: float = 0.1) -> float:
    """Get terrain height/elevation value at a position.

    Args:
        x: X coordinate
        y: Y coordinate
        scale: Noise scale (smaller = smoother)

    Returns:
        Terrain value in range [-1, 1]
    """
    return fbm(TERRAIN_NOISE, x * scale, y * scale, octaves=4)


def get_moisture(x: int, y: int, scale: float = 0.08) -> float:
    """Get moisture level at a position.

    Args:
        x: X coordinate
        y: Y coordinate
        scale: Noise scale

    Returns:
        Moisture value in range [0, 1]
    """
    raw = fbm(MOISTURE_NOISE, x * scale, y * scale, octaves=3)
    return (raw + 1) / 2  # Normalize to [0, 1]


def get_temperature(x: int, y: int, scale: float = 0.06) -> float:
    """Get temperature at a position.

    Args:
        x: X coordinate
        y: Y coordinate
        scale: Noise scale

    Returns:
        Temperature value in range [0, 1]
    """
    raw = fbm(TEMPERATURE_NOISE, x * scale, y * scale, octaves=2)
    return (raw + 1) / 2  # Normalize to [0, 1]


def determine_biome(moisture: float, temperature: float) -> BiomeType:
    """Determine biome based on moisture and temperature.

    Uses Whittaker-style biome classification.

    Args:
        moisture: Moisture level [0, 1]
        temperature: Temperature level [0, 1]

    Returns:
        The appropriate BiomeType
    """
    if temperature < 0.25:
        return BiomeType.TUNDRA
    elif temperature > 0.75 and moisture < 0.3:
        return BiomeType.DESERT
    elif moisture > 0.6:
        return BiomeType.MARSH
    elif moisture > 0.35:
        return BiomeType.FOREST
    else:
        return BiomeType.GRASSLAND


def get_biome_at(x: int, y: int) -> BiomeType:
    """Get the biome at a specific position.

    Args:
        x: X coordinate
        y: Y coordinate

    Returns:
        BiomeType at this position
    """
    moisture = get_moisture(x, y)
    temperature = get_temperature(x, y)
    return determine_biome(moisture, temperature)


def is_cave_entrance(x: int, y: int, scale: float = 0.15) -> bool:
    """Check if this position should be a cave entrance.

    Uses noise to place caves semi-randomly but coherently.

    Args:
        x: X coordinate
        y: Y coordinate
        scale: Noise scale

    Returns:
        True if this should be a cave entrance
    """
    cave_value = CAVE_NOISE.noise2(x * scale, y * scale)
    # Caves are rare - only spawn at very specific noise values
    return 0.85 < cave_value < 0.9


def generate_tile(x: int, y: int, biome: BiomeType, terrain_value: float) -> TileType:
    """Generate a tile type based on biome and terrain.

    Args:
        x: X coordinate
        y: Y coordinate
        biome: The biome at this position
        terrain_value: Terrain elevation [-1, 1]

    Returns:
        TileType for this position
    """
    config = BIOME_CONFIGS[biome]

    # Use deterministic randomness based on position
    rand_seed = (x * 73856093) ^ (y * 19349663)
    rand_val = ((rand_seed % 1000) / 1000.0)

    # Water at low terrain values
    if terrain_value < -0.3:
        return TileType.WATER

    # Rock at high terrain values
    if terrain_value > 0.6:
        return TileType.ROCK

    # Biome-specific generation
    if rand_val < config.water_density:
        return TileType.WATER
    elif rand_val < config.water_density + config.tree_density:
        return TileType.TREE
    elif rand_val < config.water_density + config.tree_density + config.rock_density:
        return TileType.ROCK

    # Base terrain based on biome
    if biome == BiomeType.DESERT:
        return TileType.SAND
    elif biome == BiomeType.TUNDRA:
        return TileType.STONE if rand_val > 0.7 else TileType.GRASS
    elif biome in (BiomeType.FOREST, BiomeType.GRASSLAND):
        return TileType.GRASS
    elif biome == BiomeType.MARSH:
        return TileType.DIRT if rand_val > 0.5 else TileType.GRASS
    else:
        return TileType.DIRT


class ProceduralWorld:
    """Procedurally generated world using noise functions.

    The world is infinite and generated on-demand based on position.
    Each seed produces a unique world.
    """

    def __init__(self, seed: int = 42):
        """Initialize the procedural world.

        Args:
            seed: Random seed for consistent generation
        """
        self.seed = seed
        self._cache: dict = {}  # Cache generated chunks

        # Create unique noise generators for this seed
        self.terrain_noise = OpenSimplex(seed=seed)
        self.moisture_noise = OpenSimplex(seed=seed + 1000)
        self.temperature_noise = OpenSimplex(seed=seed + 2000)

    def _fbm(self, noise: OpenSimplex, x: float, y: float, octaves: int = 4) -> float:
        """Fractal Brownian Motion for this world's noise."""
        value = 0.0
        amplitude = 1.0
        frequency = 1.0
        max_value = 0.0

        for _ in range(octaves):
            value += amplitude * noise.noise2(x * frequency, y * frequency)
            max_value += amplitude
            amplitude *= 0.5
            frequency *= 2.0

        return value / max_value

    def _get_terrain_value(self, x: int, y: int, scale: float = 0.1) -> float:
        """Get terrain value using this world's noise generator."""
        return self._fbm(self.terrain_noise, x * scale, y * scale, octaves=4)

    def _get_moisture(self, x: int, y: int, scale: float = 0.08) -> float:
        """Get moisture level using this world's noise generator."""
        raw = self._fbm(self.moisture_noise, x * scale, y * scale, octaves=3)
        return (raw + 1) / 2

    def _get_temperature(self, x: int, y: int, scale: float = 0.06) -> float:
        """Get temperature using this world's noise generator."""
        raw = self._fbm(self.temperature_noise, x * scale, y * scale, octaves=2)
        return (raw + 1) / 2

    def _determine_biome(self, moisture: float, temperature: float) -> BiomeType:
        """Determine biome based on moisture and temperature."""
        if temperature < 0.25:
            return BiomeType.TUNDRA
        elif temperature > 0.75 and moisture < 0.3:
            return BiomeType.DESERT
        elif moisture > 0.6:
            return BiomeType.MARSH
        elif moisture > 0.35:
            return BiomeType.FOREST
        else:
            return BiomeType.GRASSLAND

    def get_tile(self, x: int, y: int) -> Tuple[TileType, BiomeType]:
        """Get the tile and biome at a position.

        Args:
            x: X coordinate
            y: Y coordinate

        Returns:
            Tuple of (TileType, BiomeType)
        """
        cache_key = (x, y)
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Use instance methods that use this world's noise generators
        moisture = self._get_moisture(x, y)
        temperature = self._get_temperature(x, y)
        biome = self._determine_biome(moisture, temperature)
        terrain_value = self._get_terrain_value(x, y)
        tile = generate_tile(x, y, biome, terrain_value)

        result = (tile, biome)
        self._cache[cache_key] = result
        return result

    def is_walkable(self, x: int, y: int) -> bool:
        """Check if a position is walkable.

        Args:
            x: X coordinate
            y: Y coordinate

        Returns:
            True if the tile can be walked on
        """
        tile, _ = self.get_tile(x, y)
        return tile not in (TileType.WATER, TileType.TREE, TileType.ROCK, TileType.STONE, TileType.CAVE_WALL)

    def get_spawn_chance(self, x: int, y: int) -> float:
        """Get enemy spawn chance at a position.

        Args:
            x: X coordinate
            y: Y coordinate

        Returns:
            Spawn chance [0, 1]
        """
        _, biome = self.get_tile(x, y)
        config = BIOME_CONFIGS[biome]
        return config.enemy_spawn_rate

    def get_color(self, x: int, y: int) -> int:
        """Get the display color for a tile.

        Args:
            x: X coordinate
            y: Y coordinate

        Returns:
            Color palette index
        """
        tile, biome = self.get_tile(x, y)
        config = BIOME_CONFIGS[biome]

        # Tile-specific colors
        color_map = {
            TileType.WATER: 12,    # Blue
            TileType.TREE: 11,     # Light green
            TileType.ROCK: 13,     # Gray
            TileType.STONE: 5,     # Dark gray
            TileType.SAND: 10,     # Yellow
            TileType.GRASS: config.base_color,
            TileType.DIRT: 4,      # Brown
        }

        return color_map.get(tile, config.base_color)

    def generate_chunk(self, chunk_x: int, chunk_y: int, chunk_size: int = 16) -> List[List[Tuple[TileType, BiomeType]]]:
        """Generate a chunk of the world.

        Args:
            chunk_x: Chunk X coordinate
            chunk_y: Chunk Y coordinate
            chunk_size: Size of the chunk

        Returns:
            2D list of (TileType, BiomeType) tuples
        """
        chunk = []
        start_x = chunk_x * chunk_size
        start_y = chunk_y * chunk_size

        for y in range(chunk_size):
            row = []
            for x in range(chunk_size):
                world_x = start_x + x
                world_y = start_y + y
                row.append(self.get_tile(world_x, world_y))
            chunk.append(row)

        return chunk

    def clear_cache(self):
        """Clear the tile cache to free memory."""
        self._cache.clear()
