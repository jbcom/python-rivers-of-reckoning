"""Map data, constants, and game configuration for Rivers of Reckoning.

This module contains all static game data including map size, enemy types,
event definitions, achievements, difficulty settings, and shop items.
"""

MAP_SIZE = 11

ENEMY_TYPES = [
    {"name": "Goblin", "hp_mod": 0, "dmg_mod": 0, "effect": None},
    {"name": "Orc", "hp_mod": 2, "dmg_mod": 1, "effect": "rage"},
    {"name": "Slime", "hp_mod": -2, "dmg_mod": -1, "effect": "split"},
    {"name": "Wraith", "hp_mod": 0, "dmg_mod": 0, "effect": "curse"},
]

EVENT_TYPES = [
    {
        "name": "Treasure",
        "desc": "You found a hidden stash! +5 gold.",
        "effect": lambda p: setattr(p, "gold", p.gold + 5),
    },
    {
        "name": "Trap",
        "desc": "A trap! Lose 3 HP.",
        "effect": lambda p: p.take_damage(3),
    },
    {
        "name": "Wandering Merchant",
        "desc": "A merchant offers a random item.",
        "effect": None,
    },
]

ACHIEVEMENTS = [
    {"name": "First Blood", "desc": "Defeat your first enemy."},
    {"name": "Boss Slayer", "desc": "Defeat both bosses."},
    {"name": "Potion Master", "desc": "Use 5 potions."},
    {"name": "Explorer", "desc": "Reveal the entire map."},
    {"name": "Untouchable", "desc": "Win without dying once."},
]

# Direction constants for movement
DIRECTIONS = {
    "up": (0, -1, "North"),
    "down": (0, 1, "South"),
    "left": (-1, 0, "West"),
    "right": (1, 0, "East"),
}

# Tile color palette (indices map to Engine color palette)
TILE_COLORS = {
    ".": 4,   # dirt (brown)
    "~": 10,  # sand (yellow)
    "#": 5,   # stone (dark gray)
    "^": 3,   # grass (green)
    "o": 12,  # water (blue)
    "T": 11,  # tree (light green)
    "R": 6,   # rock (light gray)
}


# Sprite drawing functions using Engine
def draw_player_sprite(engine, x, y, size=8, color=8):
    """Draw player sprite using Engine primitives.

    Args:
        engine: The Engine instance for drawing
        x: X position
        y: Y position
        size: Sprite size in pixels
        color: Base color index
    """
    if engine is None:
        return
    # Main body
    engine.rect(x, y, size, size, color)


def draw_enemy_sprite(engine, x, y, size=8, color=8):
    """Draw enemy sprite using Engine primitives.

    Args:
        engine: The Engine instance for drawing
        x: X position
        y: Y position
        size: Sprite size in pixels
        color: Base color index
    """
    if engine is None:
        return
    # Enemy body (simple rectangle)
    engine.rect(x, y, size, size, color)


def draw_tree_sprite(engine, x, y, size=8, color=11):
    """Draw tree sprite using Engine primitives.

    Args:
        engine: The Engine instance for drawing
        x: X position
        y: Y position
        size: Sprite size in pixels
        color: Base color index
    """
    if engine is None:
        return
    # Trunk
    engine.rect(x + size // 3, y + size // 2, size // 3, size // 2, 4)
    # Foliage
    engine.rect(x + 1, y + 1, size - 2, size // 2, color)


def draw_rock_sprite(engine, x, y, size=8, color=13):
    """Draw rock sprite using Engine primitives.

    Args:
        engine: The Engine instance for drawing
        x: X position
        y: Y position
        size: Sprite size in pixels
        color: Base color index
    """
    if engine is None:
        return
    # Rock body
    engine.rect(x + 1, y + 2, size - 2, size - 3, color)


def draw_potion_sprite(engine, x, y, size=8, color=14):
    """Draw potion sprite using Engine primitives.

    Args:
        engine: The Engine instance for drawing
        x: X position
        y: Y position
        size: Sprite size in pixels
        color: Base color index
    """
    if engine is None:
        return
    # Bottle body
    engine.rect(x + 2, y + 3, size - 4, size - 4, color)
    # Bottle neck
    engine.rect(x + 3, y + 1, size - 6, 2, color)


def draw_treasure_sprite(engine, x, y, size=8, color=10):
    """Draw treasure sprite using Engine primitives.

    Args:
        engine: The Engine instance for drawing
        x: X position
        y: Y position
        size: Sprite size in pixels
        color: Base color index
    """
    if engine is None:
        return
    # Chest body
    engine.rect(x + 1, y + 3, size - 2, size - 4, color)
    # Chest lid
    engine.rect(x + 1, y + 2, size - 2, 2, color)


def draw_empty_sprite(engine, x, y, size=8, color=4):
    """Draw empty ground sprite using Engine primitives.

    Args:
        engine: The Engine instance for drawing
        x: X position
        y: Y position
        size: Sprite size in pixels
        color: Base color index
    """
    if engine is None:
        return
    engine.rect(x, y, size, size, color)


# Sprite drawing function mapping
SPRITES = {
    "player": draw_player_sprite,
    "enemy": draw_enemy_sprite,
    "empty": draw_empty_sprite,
    "tree": draw_tree_sprite,
    "rock": draw_rock_sprite,
    "potion": draw_potion_sprite,
    "treasure": draw_treasure_sprite,
}

# Prop and potion spawn locations
PROP_LOCATIONS = set()
POTION_LOCATIONS = set()
for i in range(3, MAP_SIZE, 3):
    PROP_LOCATIONS.add((i, i))
    PROP_LOCATIONS.add((i, (MAP_SIZE - i) % MAP_SIZE))
for i in range(2, MAP_SIZE, 4):
    if (i, MAP_SIZE - i - 1) not in PROP_LOCATIONS and (i, MAP_SIZE - i - 1) != (0, 0):
        POTION_LOCATIONS.add((i, MAP_SIZE - i - 1))

DIFFICULTY_LEVELS = {
    "Easy": {
        "max_health": 10,
        "overheal_penalty": False,
        "enemy_health_scale": 0.7,
        "enemy_damage_scale": 0.7,
        "confusion": False,
    },
    "Normal": {
        "max_health": 10,
        "overheal_penalty": False,
        "enemy_health_scale": 1.0,
        "enemy_damage_scale": 1.0,
        "confusion": False,
    },
    "Hard": {
        "max_health": 10,
        "overheal_penalty": True,
        "enemy_health_scale": 1.5,
        "enemy_damage_scale": 1.5,
        "confusion": True,
    },
}

SHOP_ITEMS = [
    {
        "name": "Sword",
        "cost": 3,
        "desc": "+1 attack damage (upgrades stack)",
        "effect": "sword",
    },
    {
        "name": "Shield",
        "cost": 3,
        "desc": "-1 enemy damage (upgrades stack)",
        "effect": "shield",
    },
    {
        "name": "Boots",
        "cost": 2,
        "desc": "Negate confusion effect (upgrades: +1 gold per enemy)",
        "effect": "boots",
    },
    {"name": "Potion", "cost": 1, "desc": "Heal 3 HP instantly", "effect": "potion"},
]


# Boss names
BOSS_NAMES = ["Dread Hydra", "Shadow Golem", "Chaos Drake"]


# Boss sprite drawing functions using Engine
def draw_boss_sprite(engine, x, y, boss_type=0, size=32):
    """Draw boss sprite using Engine primitives.

    Args:
        engine: The Engine instance for drawing
        x: X position
        y: Y position
        boss_type: Type of boss (0=Hydra, 1=Golem, 2=Drake)
        size: Sprite size
    """
    if engine is None:
        return

    if boss_type == 0:  # Dread Hydra
        # Three heads
        engine.rect(x + 4, y + 4, 8, 8, 8)
        engine.rect(x + 12, y, 8, 8, 8)
        engine.rect(x + 20, y + 4, 8, 8, 8)
        # Body
        engine.rect(x + 8, y + 12, 16, 10, 5)

    elif boss_type == 1:  # Shadow Golem
        # Body
        engine.rect(x + 4, y + 4, 24, 20, 5)
        # Arms
        engine.rect(x, y + 8, 6, 8, 5)
        engine.rect(x + 26, y + 8, 6, 8, 5)
        # Eyes
        engine.rect(x + 10, y + 10, 3, 3, 8)
        engine.rect(x + 19, y + 10, 3, 3, 8)

    elif boss_type == 2:  # Chaos Drake
        # Head
        engine.rect(x + 10, y, 12, 10, 8)
        # Body
        engine.rect(x + 8, y + 10, 16, 8, 8)
        # Wings
        engine.rect(x, y + 8, 10, 6, 5)
        engine.rect(x + 22, y + 8, 10, 6, 5)
        # Eyes
        engine.rect(x + 12, y + 4, 2, 2, 10)
        engine.rect(x + 18, y + 4, 2, 2, 10)


# Boss sprite drawing function mapping
BOSS_SPRITES = {
    0: lambda engine, x, y: draw_boss_sprite(engine, x, y, 0),
    1: lambda engine, x, y: draw_boss_sprite(engine, x, y, 1),
    2: lambda engine, x, y: draw_boss_sprite(engine, x, y, 2),
}
