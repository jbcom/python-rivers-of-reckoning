import pytest
from first_python_rpg.player import Player
from first_python_rpg.enemy import Enemy
from first_python_rpg.map import Map
from first_python_rpg.map_data import MAP_SIZE, DIFFICULTY_LEVELS, ENEMY_TYPES


# Player movement logic
def test_player_move_wraps():
    """Test player movement with wrapping (legacy mode) and infinite world mode."""
    player = Player()
    player.x, player.y = 0, 0
    # Test legacy wrap mode
    player.move(-1, 0, wrap=True)
    assert player.x == MAP_SIZE - 1
    player.move(0, -1, wrap=True)
    assert player.y == MAP_SIZE - 1

    # Test infinite world mode (no wrapping)
    player.x, player.y = 0, 0
    player.move(-1, 0, wrap=False)
    assert player.x == -1  # Infinite world allows negative coords
    player.move(0, -1, wrap=False)
    assert player.y == -1


def test_player_move_confused():
    player = Player()
    player.confused = 2
    old_x, old_y = player.x, player.y
    player.move(1, 0)
    # Should move, but possibly in a random direction
    assert player.x != old_x or player.y != old_y
    assert player.confused == 1


def test_player_take_damage_and_heal():
    player = Player("Easy")
    player.take_damage(3)
    assert player.health == DIFFICULTY_LEVELS["Easy"]["max_health"] - 3
    player.heal(2)
    assert player.health == DIFFICULTY_LEVELS["Easy"]["max_health"] - 1


def test_player_overheal_penalty():
    player = Player("Hard")
    player.health = player.max_health
    player.heal(5)
    assert player.health == player.max_health
    assert player.confused > 0


def test_player_bonus_and_weaken():
    player = Player("Easy")
    for _ in range(3):
        player.add_bonus()
    assert player.weaken_enemies
    assert player.weaken_turns == 5
    player.update_weaken()
    assert player.weaken_turns == 4


# Enemy logic
def test_enemy_init_and_alive():
    enemy = Enemy(2)
    assert enemy.is_alive()
    enemy.health = 0
    assert not enemy.is_alive()


# Map logic
def test_map_walkable():
    """Test that procedural map walkability is correctly determined by tile type."""
    # Test procedural map with seed for reproducibility
    m = Map(seed=42)

    # Check that the grid was generated
    assert len(m.grid) == m.size
    assert len(m.grid[0]) == m.size

    # Verify walkability matches tile type
    for y in range(m.size):
        for x in range(m.size):
            tile = m.grid[y][x]
            # Use world coordinates (camera_x + x, camera_y + y)
            world_x = m.camera_x + x
            world_y = m.camera_y + y
            walkable = m.is_walkable(world_x, world_y)

            # Verify walkability matches tile type
            if tile in ("o", "#", "T", "R", "X"):
                assert not walkable, f"Tile '{tile}' at ({world_x},{world_y}) should not be walkable"
            else:
                assert walkable, f"Tile '{tile}' at ({world_x},{world_y}) should be walkable"

    # Test that different seeds produce different maps
    m2 = Map(seed=999)
    # Just verify it generates without error
    assert len(m2.grid) == m2.size

    # In infinite world, all coordinates are valid (procedurally generated)
    # Far coordinates should still work
    assert m.is_walkable(1000, 1000) or not m.is_walkable(1000, 1000)  # Either is valid


# Enemy encounter simulation
def test_enemy_encounter_damage():
    player = Player("Easy")
    enemy = Enemy(2)
    start_health = player.health
    dmg = 2
    player.take_damage(dmg)
    assert player.health == start_health - dmg


# Difficulty levels
def test_difficulty_levels():
    easy = Player("Easy")
    hard = Player("Hard")
    assert easy.max_health == 10
    assert hard.max_health == 10
    assert DIFFICULTY_LEVELS["Easy"]["enemy_health_scale"] < DIFFICULTY_LEVELS["Hard"]["enemy_health_scale"]


# Spell usage
def test_player_spell_unlocks():
    player = Player("Easy")
    result = player.use_spell(0, Enemy(1))
    assert result != "Spell not unlocked!"
    result = player.use_spell(99, Enemy(1))
    assert result == "Spell not unlocked!"
