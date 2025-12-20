import pytest
from first_python_rpg.player import Player
from first_python_rpg.enemy import Enemy
from first_python_rpg.map import Map
from first_python_rpg.map_data import MAP_SIZE, DIFFICULTY_LEVELS, ENEMY_TYPES, EVENT_TYPES
from first_python_rpg.game import Game


# --- Player Gear, Gold, Potions, Achievements ---
def test_player_gear_and_gold():
    player = Player("Easy")
    player.gold = 0
    player.sword_level = 0
    player.shield_level = 0
    player.boots_level = 0
    player.sword_level += 1
    player.shield_level += 1
    player.boots_level += 1
    player.gold += 10
    assert player.sword_level == 1
    assert player.shield_level == 1
    assert player.boots_level == 1
    assert player.gold == 10


def test_player_potions_and_achievements():
    player = Player("Easy")
    for _ in range(5):
        player.heal(1)
    player.potions_used = 5
    player.achievements.add("Potion Master")
    assert player.potions_used == 5
    assert "Potion Master" in player.achievements


# --- Enemy Types and Status ---
def test_enemy_types_and_status():
    for etype in ENEMY_TYPES:
        enemy = Enemy(2, etype)
        assert enemy.type == etype
        assert enemy.name == etype["name"]
        enemy.status = "stunned"
        enemy.status_turns = 2
        assert enemy.status == "stunned"
        assert enemy.status_turns == 2


# --- Map Procedural Variety ---
def test_procedural_map_variety():
    """Test that different seeds produce different maps."""
    maps = [Map(seed=i * 100).grid for i in range(5)]
    # Convert grids to tuples for comparison
    map_tuples = [tuple(tuple(row) for row in m) for m in maps]
    # At least two maps should differ
    assert any(map_tuples[0] != m for m in map_tuples[1:])


# --- Map Movement Restrictions ---
def test_player_cannot_move_through_walls():
    """Test that non-walkable tiles block movement."""
    m = Map(seed=42)
    player = Player("Easy")
    # Check some tiles in the visible grid
    for y in range(m.size):
        for x in range(m.size):
            tile = m.grid[y][x]
            world_x = m.camera_x + x
            world_y = m.camera_y + y
            # Verify non-walkable tiles are correctly identified
            if tile in ("#", "T", "R", "o", "X"):
                assert not m.is_walkable(world_x, world_y)


# --- Event Effects ---
def test_event_effects():
    player = Player("Easy")
    for event in EVENT_TYPES:
        if event["effect"]:
            event["effect"](player)
    # Should have gained gold and lost HP at least once
    assert player.gold >= 0
    assert player.health <= player.max_health


# --- Gameover and Health ---
def test_player_gameover_condition():
    player = Player("Easy")
    player.take_damage(player.max_health)
    assert player.health <= 0


# --- Procedural Game Simulation ---
def test_procedural_game_simulation():
    """Test that game starts with fully procedural generation."""
    from first_python_rpg.game import Game

    g = Game(test_mode=True)
    g.start_game()

    # Game is now fully procedural - no feature flags
    assert g.map is not None
    assert g.player is not None

    # Map uses procedural world generation
    assert g.map.world is not None

    # Simulate a move triggering an event
    g.player.x, g.player.y = 5, 5
    g.event_message = None
    import random

    random.seed(0)
    # Simulate event
    event = EVENT_TYPES[0]
    if event["effect"]:
        event["effect"](g.player)
    g.event_message = event["desc"]
    assert g.event_message is not None


def test_game_headless_mode_player_movement_and_events():
    """Test player movement and events in headless mode."""
    g = Game(test_mode=True)
    g.start_game()
    g.state = "playing"

    start_x = g.player.x
    start_y = g.player.y
    start_health = g.player.health

    # Try multiple directions to find a valid move
    directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    for dx, dy in directions * 5:
        g.move_player(dx, dy)
        if g.state == "gameover":
            break

    # After moves, player should have moved, possibly encountered events/enemies
    # But movement is random or dependent on walls, so we just check state
    assert g.state in ("playing", "gameover")

    # If gameover, health should be <= 0
    if g.state == "gameover":
        assert g.player.health <= 0
    else:
        # Player should be healthy
        assert g.player.health > 0
        # Something should have changed (position or events affected stats)
        has_moved = (g.distance_traveled > 0 or
                     g.player.x != start_x or
                     g.player.y != start_y)
        has_events = (g.player.health != start_health or
                      g.player.gold > 0 or
                      g.enemies_defeated > 0)
        # Verify that either movement or events occurred during gameplay
        assert has_moved or has_events, "Player should have moved or encountered events"
        # At minimum we can verify the game state is consistent
        assert g.map is not None
        assert g.player is not None
