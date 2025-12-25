#!/usr/bin/env python3
"""Test script to verify the new library structure works"""


def test_library_import():
    """Test that we can import the library modules"""
    from rivers_of_reckoning import Game, Player, Enemy

    print("✓ Core library imports successful")

    # Test individual module imports
    from rivers_of_reckoning.map import Map
    from rivers_of_reckoning.map_data import MAP_SIZE, ENEMY_TYPES
    from rivers_of_reckoning.procedural_enemies import ProceduralEnemyGenerator

    print("✓ All module imports successful")

    # Assertions for pytest
    assert Game is not None
    assert Player is not None
    assert Enemy is not None
    assert Map is not None
    assert MAP_SIZE > 0
    assert ENEMY_TYPES is not None
    assert ProceduralEnemyGenerator is not None


def test_basic_functionality():
    """Test basic game object creation"""
    from rivers_of_reckoning import Player, Enemy
    from rivers_of_reckoning.map import Map
    from rivers_of_reckoning.procedural_enemies import ProceduralEnemyGenerator

    # Test object creation
    player = Player()
    print(f"✓ Player created with health {player.health}")
    assert player.health > 0

    enemy = Enemy()
    print(f"✓ Enemy created: {enemy.name}")
    assert enemy.name is not None

    game_map = Map()
    print(f"✓ Map created with size {game_map.size}x{game_map.size}")
    assert game_map.size > 0

    # Test procedural generation
    generator = ProceduralEnemyGenerator()
    proc_enemy = generator.generate_enemy(level=1)
    print(f"✓ Procedural enemy generated: {proc_enemy['name']}")
    assert proc_enemy["name"] is not None


def test_game_creation():
    """Test that we can create a game instance."""
    from rivers_of_reckoning import Game

    print("✓ Game class can be imported")
    assert Game is not None

    # Test headless game creation
    game = Game(test_mode=True)
    print("✓ Game created in test mode")
    assert game is not None
    # Game now starts at title screen for fully procedural game
    assert game.state == "title"


def main():
    """Run all tests"""
    import sys

    print("Testing new library structure...")

    tests = [test_library_import, test_basic_functionality, test_game_creation]

    passed = 0
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"✗ Test {test.__name__} failed: {e}")

    print(f"\n{passed}/{len(tests)} tests passed")

    if passed == len(tests):
        print("✓ All tests passed! Library structure is working correctly.")
        return True
    else:
        print("✗ Some tests failed.")
        return False


if __name__ == "__main__":
    import sys

    success = main()
    sys.exit(0 if success else 1)
