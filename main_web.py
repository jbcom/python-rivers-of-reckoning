import asyncio
from first_python_rpg.game import Game

# Pygbag expects an async main function
async def main():
    # Initialize game in non-test mode (starts pygame)
    g = Game()

    # The Game.run() method now uses Engine.run() which returns a coroutine for the main loop
    if g.engine:
        await g.engine.run(g.update, g.draw)

if __name__ == "__main__":
    asyncio.run(main())
