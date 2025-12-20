import random
from .map_data import ENEMY_TYPES


class Enemy:
    def __init__(self, strength=1, etype=None):
        if etype is None:
            etype = random.choice(ENEMY_TYPES)
        self.type = etype
        self.name = etype["name"]
        self.strength = strength + etype["dmg_mod"]
        self.health = max(1, strength * 2 + etype["hp_mod"])
        self.effect = etype["effect"]
        self.status = None
        self.status_turns = 0

    def is_alive(self):
        return self.health > 0
