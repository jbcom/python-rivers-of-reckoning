"""Map module for Rivers of Reckoning.

This module provides the Map class for terrain generation and rendering
using the pygame-ce Engine abstraction with procedural world generation.
"""

import random

from .map_data import MAP_SIZE, TILE_COLORS
from .world_gen import BIOME_CONFIGS, BiomeType, ProceduralWorld, TileType


class Map:
    """Game map with procedural terrain generation and rendering.

    The map is fully procedurally generated using OpenSimplex noise
    for natural-looking terrain with biomes, inspired by Otterfall's
    SDF-based world generation approach.

    Attributes:
        size: The visible map viewport size
        world: ProceduralWorld instance for terrain generation
        camera_x: Camera X position in world coordinates
        camera_y: Camera Y position in world coordinates
        tile_size: Calculated tile size for rendering
    """

    # Mapping from TileType to legacy character codes for compatibility
    TILE_CHAR_MAP = {
        TileType.DIRT: ".",
        TileType.GRASS: "^",
        TileType.SAND: "~",
        TileType.STONE: "#",
        TileType.WATER: "o",
        TileType.TREE: "T",
        TileType.ROCK: "R",
        TileType.CAVE_FLOOR: "_",
        TileType.CAVE_WALL: "X",
    }

    def __init__(self, seed: int = 42):
        """Initialize the procedurally generated map.

        Args:
            seed: Random seed for world generation
        """
        self.size = MAP_SIZE
        self.world = ProceduralWorld(seed=seed)
        self.camera_x = 0
        self.camera_y = 0
        self.tile_size = 256 // MAP_SIZE
        self._current_biome = BiomeType.MARSH

        # Generate initial grid for compatibility with existing code
        self.grid = self._generate_visible_grid()

    def _generate_visible_grid(self):
        """Generate the currently visible grid from the procedural world.

        Returns:
            A 2D grid of tile characters for the visible area.
        """
        grid = []
        for local_y in range(self.size):
            row = []
            for local_x in range(self.size):
                world_x = self.camera_x + local_x
                world_y = self.camera_y + local_y
                tile_type, biome = self.world.get_tile(world_x, world_y)
                char = self.TILE_CHAR_MAP.get(tile_type, ".")
                row.append(char)
            grid.append(row)
        return grid

    def update_camera(self, player_x: int, player_y: int):
        """Update camera position to follow the player.

        Args:
            player_x: Player X position in world coordinates
            player_y: Player Y position in world coordinates
        """
        # Center camera on player
        half_size = self.size // 2
        self.camera_x = player_x - half_size
        self.camera_y = player_y - half_size

        # Update the grid cache
        self.grid = self._generate_visible_grid()

        # Update current biome
        _, self._current_biome = self.world.get_tile(player_x, player_y)

    def get_current_biome(self) -> BiomeType:
        """Get the biome at the player's current position.

        Returns:
            BiomeType enum value
        """
        return self._current_biome

    def get_biome_config(self):
        """Get configuration for the current biome.

        Returns:
            BiomeConfig for the current biome
        """
        return BIOME_CONFIGS.get(self._current_biome)

    def is_walkable(self, x, y):
        """Check if a world position is walkable.

        Args:
            x: World X coordinate
            y: World Y coordinate

        Returns:
            True if the tile can be walked on, False otherwise.
        """
        return self.world.is_walkable(x, y)

    def draw(self, engine):
        """Draw the visible map using Engine and procedural world generation."""
        if engine is None:
            return

        # Map tile size adjusted for 960x960
        draw_tile_size = engine.width // self.size

        for local_y in range(self.size):
            for local_x in range(self.size):
                world_x = self.camera_x + local_x
                world_y = self.camera_y + local_y

                tile_type, biome = self.world.get_tile(world_x, world_y)
                char = self.TILE_CHAR_MAP.get(tile_type, ".")
                color = TILE_COLORS.get(char, 0)

                # Calculate pixel position
                px = local_x * draw_tile_size
                py = local_y * draw_tile_size + 60  # Offset for high-res HUD

                # Draw base tile
                engine.rect(px, py, draw_tile_size, draw_tile_size, color)

                # 2.5D Depth: High-res visual detail
                if tile_type == TileType.TREE:
                    # Tree shadow
                    engine.circ(px + draw_tile_size // 2, py + draw_tile_size - 10, draw_tile_size // 3, 0)
                    # Tree trunk
                    engine.rect(px + draw_tile_size // 2 - 4, py + 20, 8, draw_tile_size - 20, 4)
                    # Tree crown (Poison Ivy) - layered for height
                    engine.circ(px + draw_tile_size // 2, py + 15, draw_tile_size // 2 - 5, 11)
                    engine.circ(px + draw_tile_size // 2, py + 5, draw_tile_size // 3, 3)
                elif tile_type == TileType.ROCK:
                    # Rock body
                    engine.rect(px + 10, py + 10, draw_tile_size - 20, draw_tile_size - 20, 5)
                    engine.rect(px + 15, py + 15, 10, 10, 6)
                elif tile_type == TileType.WATER:
                    # High-res river ripple
                    engine.line(px + 10, py + 20, px + 30, py + 20, 12)
                    engine.line(px + 20, py + 40, px + 50, py + 40, 12)

    def move_player(self, player, dx, dy):
        """Move player with world constraints.

        Uses world coordinates for infinite map exploration.

        Args:
            player: The Player instance
            dx: X direction (-1, 0, or 1)
            dy: Y direction (-1, 0, or 1)
        """
        if player.confused > 0 and random.random() < 0.5:
            dx, dy = random.choice([(0, 1), (0, -1), (1, 0), (-1, 0)])

        new_x = player.x + dx
        new_y = player.y + dy

        if self.is_walkable(new_x, new_y):
            player.x = new_x
            player.y = new_y
            # Update camera to follow player
            self.update_camera(player.x, player.y)

        if player.confused > 0:
            player.confused -= 1

    def get_spawn_chance(self, x: int, y: int) -> float:
        """Get enemy spawn chance at a world position.

        Args:
            x: World X coordinate
            y: World Y coordinate

        Returns:
            Spawn probability [0, 1]
        """
        return self.world.get_spawn_chance(x, y)
