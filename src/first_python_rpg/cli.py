#!/usr/bin/env python3
"""CLI entry point for Rivers of Reckoning.

This provides a command-line interface that works the same as
the main.py entry point, using async for pygbag compatibility.
"""

import sys
import asyncio


async def run_game():
    """Run the game asynchronously."""
    from .game import Game

    game = Game()
    if game.engine:
        await game.engine.run(game.update, game.draw)


def main():
    """Main CLI entry point."""
    print("Starting Rivers of Reckoning...")

    try:
        asyncio.run(run_game())
    except KeyboardInterrupt:
        print("\nGame interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
