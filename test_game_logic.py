import pytest
from first_python_rpg.player import Player
from first_python_rpg.enemy import Enemy
from first_python_rpg.map import Map
from first_python_rpg.map_data import MAP_SIZE, DIFFICULTY_LEVELS, ENEMY_TYPES


# Player movement logic
def test_player_move_wraps():
    player = Player()
    player.x, player.y = 0, 0
    player.move(-1, 0)
    assert player.x == MAP_SIZE - 1
    player.move(0, -1)
    assert player.y == MAP_SIZE - 1


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
    m = Map()
    # Not all tiles are walkable in a generated map (walls, rocks, water)
    # We should just check that is_walkable returns a boolean
    for y in range(m.size):
        for x in range(m.size):
            assert isinstance(m.is_walkable(x, y), bool)

    m = Map(procedural=True)
    for y in range(m.size):
        for x in range(m.size):
            if m.grid[y][x] == "#":
                assert not m.is_walkable(x, y)


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
