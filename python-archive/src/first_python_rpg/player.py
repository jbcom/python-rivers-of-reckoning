import random
from .map_data import DIFFICULTY_LEVELS, MAP_SIZE


class Player:
    def __init__(self, difficulty="Easy"):
        self.x = MAP_SIZE // 2  # Center player horizontally
        self.y = MAP_SIZE // 2  # Center player vertically
        self.health = DIFFICULTY_LEVELS[difficulty]["max_health"]
        self.max_health = DIFFICULTY_LEVELS[difficulty]["max_health"]
        self.score = 0
        self.bonus_points = 0
        self.weaken_enemies = False
        self.weaken_turns = 0
        self.confused = 0
        self.difficulty = difficulty
        self.gear = set()
        self.gold = 0
        self.extra_move = False
        self.sword_level = 0
        self.shield_level = 0
        self.boots_level = 0
        self.mana = 5
        self.max_mana = 5
        self.spells = [
            {
                "name": "Fireball",
                "cost": 2,
                "desc": "Deal 4-7 damage",
                "effect": "fireball",
            },
            {"name": "Heal", "cost": 2, "desc": "Restore 4 HP", "effect": "heal"},
            {
                "name": "Shield Up",
                "cost": 3,
                "desc": "Block next attack",
                "effect": "block",
            },
            {
                "name": "Stun",
                "cost": 3,
                "desc": "Stun enemy for 1 turn",
                "effect": "stun",
            },
            {
                "name": "Poison",
                "cost": 2,
                "desc": "Poison enemy (2 dmg/turn)",
                "effect": "poison",
            },
            {
                "name": "Mana Regen",
                "cost": 0,
                "desc": "Restore 2 mana (1/encounter)",
                "effect": "manaregen",
            },
        ]
        self.spell_unlocks = {0, 1, 2}
        self.block_next = False
        self.exp = 0
        self.level = 1
        self.exp_to_next = 10
        self.achievements = set()
        self.potions_used = 0
        self.bosses_defeated = 0
        self.explored = set()

    def move(self, dx, dy, wrap=False):
        """Move the player in the world.

        Args:
            dx: X direction (-1, 0, or 1)
            dy: Y direction (-1, 0, or 1)
            wrap: If True, wrap around map edges (legacy mode)
        """
        if self.confused > 0 and random.random() < 0.5:
            dx, dy = random.choice([(0, 1), (0, -1), (1, 0), (-1, 0)])

        if wrap:
            self.x = (self.x + dx) % MAP_SIZE
            self.y = (self.y + dy) % MAP_SIZE
        else:
            # Infinite world - no wrapping
            self.x = self.x + dx
            self.y = self.y + dy

        if self.confused > 0:
            self.confused -= 1

    def take_damage(self, dmg):
        self.health -= dmg

    def heal(self, amt):
        self.health += amt
        self.potions_used += 1
        if not DIFFICULTY_LEVELS[self.difficulty]["overheal_penalty"]:
            self.health = min(self.health, self.max_health)
        elif self.health > self.max_health:
            self.confused = random.randint(2, 5)
            self.health = self.max_health

    def add_bonus(self):
        self.bonus_points += 1
        if self.bonus_points >= 3:
            self.weaken_enemies = True
            self.weaken_turns = 5
            self.bonus_points = 0

    def update_weaken(self):
        if self.weaken_enemies:
            self.weaken_turns -= 1
            if self.weaken_turns <= 0:
                self.weaken_enemies = False

    def has_gear(self, gear):
        return getattr(self, f"{gear}_level", 0) > 0

    def use_spell(self, idx, enemy):
        if idx not in self.spell_unlocks:
            return "Spell not unlocked!"
        spell = self.spells[idx]
        if self.mana < spell["cost"]:
            return "Not enough mana!"
        self.mana -= spell["cost"]
        if spell["effect"] == "fireball":
            dmg = random.randint(4, 7)
            enemy.health -= dmg
            return f"You cast Fireball! {dmg} damage."
        elif spell["effect"] == "heal":
            self.heal(4)
            return "You cast Heal! +4 HP."
        elif spell["effect"] == "block":
            self.block_next = True
            return "You cast Shield Up! Block next attack."
        elif spell["effect"] == "stun":
            enemy.status = "stunned"
            enemy.status_turns = 1
            return "You cast Stun! Enemy is stunned."
        elif spell["effect"] == "poison":
            enemy.status = "poisoned"
            enemy.status_turns = 3
            return "You cast Poison! Enemy is poisoned."
        elif spell["effect"] == "manaregen":
            self.mana = min(self.max_mana, self.mana + 2)
            return "You cast Mana Regen! +2 Mana."
        return "Spell fizzled."

    def gain_exp(self, amount):
        self.exp += amount
        leveled = False
        while self.exp >= self.exp_to_next:
            self.exp -= self.exp_to_next
            self.level += 1
            self.exp_to_next = int(self.exp_to_next * 1.5)
            self.max_health += 2
            self.health = self.max_health
            self.max_mana += 1
            self.mana = self.max_mana
            leveled = True
        return leveled
