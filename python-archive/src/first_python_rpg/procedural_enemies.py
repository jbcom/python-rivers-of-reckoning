"""Procedural enemy generation for Rivers of Reckoning.

This module provides procedural generation of enemies with varied
stats, types, and difficulty scaling based on player level.
"""

import random


class ProceduralEnemyGenerator:
    """Procedural enemy generation system."""

    def __init__(self):
        self.enemy_types = [
            "Goblin",
            "Orc",
            "Slime",
            "Wraith",
            "Skeleton",
            "Spider",
            "Rat",
            "Bat",
            "Wolf",
            "Bear",
            "Dragon",
            "Minotaur",
        ]
        self.color_variants = [
            8,   # Red
            9,   # Orange
            10,  # Yellow
            11,  # Green
            12,  # Blue
            13,  # Indigo
            14,  # Purple
            15,  # Pink
        ]

    def generate_enemy(self, level=1):
        """Generate a procedural enemy with stats based on level.

        Args:
            level: The difficulty level (affects HP and damage)

        Returns:
            A dictionary with enemy attributes.
        """
        base_type = random.choice(self.enemy_types)
        color = random.choice(self.color_variants)

        # Scale stats with level
        hp = random.randint(3, 8) + level
        damage = random.randint(1, 3) + (level // 2)

        return {
            "name": f"{base_type} (Level {level})",
            "type": base_type,
            "color": color,
            "hp": hp,
            "damage": damage,
            "level": level,
        }

    def generate_boss(self, level=5):
        """Generate a boss enemy.

        Args:
            level: The boss difficulty level

        Returns:
            A dictionary with boss attributes.
        """
        boss_types = ["Dragon", "Minotaur", "Demon Lord", "Lich King"]
        boss_type = random.choice(boss_types)

        return {
            "name": f"{boss_type} (Boss)",
            "type": boss_type,
            "color": 8,  # Red for bosses
            "hp": 20 + level * 3,
            "damage": 5 + level,
            "level": level,
            "is_boss": True,
        }


# Legacy function stubs to maintain API compatibility
def load_enemy_spritesheet(path, sprite_size):
    """Legacy function - not used in pygame-ce version."""
    return []


def generate_enemy_sprite(enemy_sprites, overlays, variant):
    """Legacy function - not used in pygame-ce version."""
    return None


def generate_procedural_enemy_sprite(base_surface, color_tint=None, overlay=None, overlay_alpha=128):
    """Legacy function - not used in pygame-ce version."""
    return None
