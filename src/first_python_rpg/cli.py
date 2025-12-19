#!/usr/bin/env python3
"""CLI entry point for First Python RPG"""

import sys
from .game import Game


def main():
    """Main CLI entry point"""
    print("Starting First Python RPG (Pygame-ce Edition)...")

    try:
        game = Game()
        game.run()
    except KeyboardInterrupt:
        print("\nGame interrupted by user")
        sys.exit(0)
    except Exception as e:
        # print(f"Error: {e}")
        raise e
        sys.exit(1)


if __name__ == "__main__":
    main()
