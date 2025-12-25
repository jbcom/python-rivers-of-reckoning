#!/usr/bin/env python3
"""Rivers of Reckoning - Main entry point for pygbag web deployment.

This is the sole entry point for the game, designed for responsive
web gameplay through pygbag. The game automatically scales to fit
any screen size while maintaining aspect ratio.
"""

import asyncio


async def main():
    """Async main function for pygbag compatibility."""
    # Import here to ensure pygame initializes in async context
    from rivers_of_reckoning.game import Game

    game = Game()

    if game.engine:
        await game.engine.run(game.update, game.draw)


if __name__ == "__main__":
    asyncio.run(main())
