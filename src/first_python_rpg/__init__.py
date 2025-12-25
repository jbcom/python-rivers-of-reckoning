"""Rivers of Reckoning - A fully procedural RPG built with pygame-ce.

Features infinite world generation using OpenSimplex noise,
ECS architecture, dynamic biomes, and web deployment via pygbag.
"""

__version__ = "0.5.0"
__author__ = "Your Name"
__email__ = "you@example.com"
__description__ = (
    "A fully procedural Python RPG with infinite world generation, "
    "ECS architecture, dynamic biomes, and web deployment via pygbag."
)

from .game import Game
from .player import Player
from .enemy import Enemy

__all__ = ["Game", "Player", "Enemy"]
