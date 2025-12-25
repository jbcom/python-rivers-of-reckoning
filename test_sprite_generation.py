#!/usr/bin/env python3
"""Test script to verify sprite procedural generation works correctly."""


def test_sprite_functions():
    """Test that all sprite functions can be imported and called."""
    print("Testing sprite procedural generation...")

    try:
        from first_python_rpg.map_data import SPRITES, BOSS_SPRITES

        # Test regular sprites
        sprite_count = len(SPRITES)
        boss_count = len(BOSS_SPRITES)

        print(f"✓ Found {sprite_count} sprite types")
        print(f"✓ Found {boss_count} boss sprite types")

        # Test that all sprites are callable
        for name, sprite_func in SPRITES.items():
            if not callable(sprite_func):
                raise ValueError(f"Sprite {name} is not callable")

            # Test calling the sprite function with None engine (graceful handling)
            try:
                sprite_func(None, 10, 10, 8, 8)
                print(f"✓ {name} sprite function works")
            except Exception as e:
                print(f"✗ {name} sprite function failed: {e}")
                return False

        # Test boss sprites
        for boss_id, boss_func in BOSS_SPRITES.items():
            if not callable(boss_func):
                raise ValueError(f"Boss sprite {boss_id} is not callable")

            try:
                boss_func(None, 10, 10)
                print(f"✓ Boss sprite {boss_id} function works")
            except Exception as e:
                print(f"✗ Boss sprite {boss_id} function failed: {e}")
                return False

        print("✓ All sprite functions are working correctly")

    except Exception as e:
        print(f"✗ Sprite test failed: {e}")
        raise


def test_game_components():
    """Test that game components work with new sprites."""
    print("\nTesting game components...")

    try:
        # Test game import
        from first_python_rpg.game import Game

        print("✓ Game class imported successfully")

        # Test map import
        from first_python_rpg.map import Map

        print("✓ Map class imported successfully")

        # Test boss import
        from first_python_rpg.boss import (
            boss_battle,
            update_boss_battle,
            draw_boss_battle,
        )

        print("✓ Boss system imported successfully")

        print("✓ All game components imported successfully")

    except Exception as e:
        print(f"✗ Game component test failed: {e}")
        raise


def main():
    """Run all tests."""
    print("Running sprite procedural generation tests...")

    success = True
    success &= test_sprite_functions()
    success &= test_game_components()

    if success:
        print("\n✓ All tests passed! Sprite procedural generation is working correctly.")
        return 0
    else:
        print("\n✗ Some tests failed.")
        return 1


if __name__ == "__main__":
    import sys

    sys.exit(main())
