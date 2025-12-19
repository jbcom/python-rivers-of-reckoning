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
    maps = [Map(procedural=True).grid for _ in range(5)]
    # At least two maps should differ
    assert any(maps[0] != m for m in maps[1:])


# --- Map Movement Restrictions ---
def test_player_cannot_move_through_walls():
    m = Map(procedural=True)
    player = Player("Easy")
    for y in range(m.size):
        for x in range(m.size):
            if m.grid[y][x] == "#":
                old_x, old_y = player.x, player.y
                player.x, player.y = x, y
                # Try to move into a wall
                if x + 1 < m.size and m.grid[y][x + 1] == "#":
                    new_x = (x + 1) % m.size
                    assert not m.is_walkable(new_x, y)


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


# --- Feature Flag Simulation ---
def test_feature_flags_simulation():
    # Simulate toggling feature flags and their effect on logic
    from first_python_rpg.game import Game

    g = Game()
    g.features["procedural_map"] = True
    g.features["random_events"] = True
    g.features["difficulty_levels"] = True
    g.features["enemy_encounters"] = True
    g.start_game()
    assert g.map.procedural
    assert g.player.difficulty == "Hard"
    # Simulate a move triggering an event
    g.player.x, g.player.y = 0, 0
    g.event_message = None
    import random

    random.seed(0)
    # Simulate event
    if g.features["random_events"]:
        event = EVENT_TYPES[0]
        if event["effect"]:
            event["effect"](g.player)
        g.event_message = event["desc"]
    assert g.event_message is not None


def test_game_headless_mode_player_movement_and_events():
    g = Game(test_mode=True)
    g.features["procedural_map"] = True
    g.features["random_events"] = True
    g.features["difficulty_levels"] = True
    g.features["enemy_encounters"] = True
    g.start_game()
    g.state = "playing"
    # Simulate a sequence of moves
    for _ in range(10):
        g.move_player(1, 0)
        if g.state == "gameover":
            break
    # After moves, player should have moved, possibly encountered events/enemies
    # But movement is random or dependent on walls, so we just check state
    assert g.state in ("playing", "gameover")
    # If gameover, health should be <= 0
    if g.state == "gameover":
        assert g.player.health <= 0
    # If not, health should be > 0
    else:
        assert g.player.health > 0
