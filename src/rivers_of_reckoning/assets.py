"""Asset management for Rivers of Reckoning.

Handles loading and scaling of all image assets for character animations,
objects, weapons, and the world map.
"""

import os
import pygame

# Asset directory relative to the package
ASSET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'images')

def load_scaled(img_path, size):
    """Load an image and scale it to the specified size."""
    if not os.path.exists(img_path):
        # Create a placeholder surface if image is missing
        surf = pygame.Surface(size)
        surf.fill((255, 0, 255)) # Magenta placeholder
        return surf
        
    surf = pygame.image.load(img_path)
    if surf.get_alpha() is not None or surf.get_masks()[3] != 0:
        surf = surf.convert_alpha()
    else:
        surf = surf.convert()
    return pygame.transform.smoothscale(surf, size)

class AssetManager:
    """Manages all game assets with caching and scaling."""
    
    def __init__(self, scale=1.5):
        self.scale = scale
        self.assets = {}
        self.load_all()

    def load_all(self):
        """Preload and scale all assets."""
        # Sizes based on the original Pygame RPG (960x960 logical context)
        PLAYER_SIZE = (int(60 * self.scale), int(60 * self.scale))
        ENEMY_SIZE = (int(56 * self.scale), int(56 * self.scale))
        MAP_TILE_SIZE = (int(64 * self.scale), int(64 * self.scale))
        INVENTORY_ICON_SIZE = (int(40 * self.scale), int(40 * self.scale))
        WEAPON_ICON_SIZE = (int(32 * self.scale), int(32 * self.scale))

        # Character animations
        self.assets['character'] = {
            'idle': [load_scaled(os.path.join(ASSET_DIR, 'character', f'idle_{i}.png'), PLAYER_SIZE) for i in range(4)],
            'run': [load_scaled(os.path.join(ASSET_DIR, 'character', f'run_{i}.png'), PLAYER_SIZE) for i in range(6)],
            'jump': [load_scaled(os.path.join(ASSET_DIR, 'character', f'jump_{i}.png'), PLAYER_SIZE) for i in range(4)],
            'swim': [load_scaled(os.path.join(ASSET_DIR, 'character', f'swim_{i}.png'), PLAYER_SIZE) for i in range(6)],
            'attack': [load_scaled(os.path.join(ASSET_DIR, 'character', f'attack_{i}.png'), PLAYER_SIZE) for i in range(4)],
            'x': [load_scaled(os.path.join(ASSET_DIR, 'character', f'x_{i}.png'), PLAYER_SIZE) for i in range(4)],
        }

        # Objects
        objects_dir = os.path.join(ASSET_DIR, 'objects')
        self.assets['objects'] = {
            'advance_lens': load_scaled(os.path.join(objects_dir, 'advance lens.png'), MAP_TILE_SIZE),
            'drill': load_scaled(os.path.join(objects_dir, 'drill.png'), MAP_TILE_SIZE),
            'fast_sailing': load_scaled(os.path.join(objects_dir, 'fast sailing.png'), MAP_TILE_SIZE),
            'gift_box': load_scaled(os.path.join(objects_dir, 'gift box.png'), MAP_TILE_SIZE),
            'treasure_map': load_scaled(os.path.join(objects_dir, 'Treasure map.png'), MAP_TILE_SIZE),
            'weapon_box': load_scaled(os.path.join(objects_dir, 'weapon box.png'), MAP_TILE_SIZE),
        }

        # Weapons
        weapons_dir = os.path.join(ASSET_DIR, 'weapons')
        self.assets['weapons'] = {
            'katana': load_scaled(os.path.join(weapons_dir, 'w_katana.png'), WEAPON_ICON_SIZE),
            'mace': load_scaled(os.path.join(weapons_dir, 'w_mace.png'), WEAPON_ICON_SIZE),
            'sword_roman': load_scaled(os.path.join(weapons_dir, 'w_sword_roman.png'), WEAPON_ICON_SIZE),
        }

        # World Map
        map_path = os.path.join(ASSET_DIR, 'map.png')
        if os.path.exists(map_path):
            self.assets['map_texture'] = pygame.image.load(map_path).convert()
        else:
            self.assets['map_texture'] = None

    def get_anim(self, category, state, frame):
        """Get a specific animation frame."""
        anims = self.assets.get(category, {}).get(state, [])
        if not anims:
            return None
        return anims[frame % len(anims)]

    def get_object(self, name):
        """Get an object sprite."""
        return self.assets.get('objects', {}).get(name)

    def get_weapon(self, name):
        """Get a weapon sprite."""
        return self.assets.get('weapons', {}).get(name)
