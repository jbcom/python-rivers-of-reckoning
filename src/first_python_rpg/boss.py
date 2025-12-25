"""Boss battle system using pygame-ce Engine."""
import random
from .map_data import BOSS_NAMES


def boss_battle(game, player, boss_num, boss_strength, boss_health):
    """Initialize boss battle state.

    Args:
        game: The Game instance
        player: The Player instance
        boss_num: Boss number (1-3)
        boss_strength: Base strength of the boss
        boss_health: Starting health of the boss

    Returns:
        bool: True if boss is immediately defeated, False otherwise
    """
    boss_idx = boss_num - 1
    boss_name = BOSS_NAMES[boss_idx]
    boss_cur_health = boss_health
    message = f"Boss Fight: {boss_name}!"
    boss_ability_cd = 3
    boss_ability = None

    # Set game state to boss battle
    game.state = "boss_battle"
    game.boss_data = {
        "boss_idx": boss_idx,
        "boss_name": boss_name,
        "boss_cur_health": boss_cur_health,
        "boss_max_health": boss_health,
        "boss_strength": boss_strength,
        "message": message,
        "boss_ability_cd": boss_ability_cd,
        "boss_ability": boss_ability,
        "player": player,
        "pending_action": None,  # Track pending action for next update
    }

    return boss_cur_health <= 0


def update_boss_battle(game):
    """Update boss battle state using Engine input.

    Args:
        game: The Game instance with boss_data and engine

    Returns:
        bool: True if boss is defeated, False otherwise
    """
    boss_data = game.boss_data
    player = boss_data["player"]

    if not game.engine:
        return False

    # Handle input using Engine
    if game.engine.btnp("a"):
        # Attack
        dmg = random.randint(2, 4) + player.sword_level
        boss_data["boss_cur_health"] -= dmg
        boss_data["message"] = f"You attack for {dmg}!"

    elif game.engine.btnp("s"):
        # Spell casting (simplified)
        if player.mana >= 3:
            spell_dmg = random.randint(3, 6)
            boss_data["boss_cur_health"] -= spell_dmg
            player.mana -= 3
            boss_data["message"] = f"Fireball hits for {spell_dmg}!"
        else:
            boss_data["message"] = "Not enough mana!"

    elif game.engine.btnp("escape"):
        # Quit battle
        game.state = "playing"
        return False

    # Boss abilities
    boss_data["boss_ability_cd"] -= 1
    if boss_data["boss_ability_cd"] <= 0:
        boss_idx = boss_data["boss_idx"]
        boss_strength = boss_data["boss_strength"]

        if boss_idx == 0:  # Hydra
            bdmg = random.randint(2, 4) + boss_strength
            player.take_damage(bdmg)
            player.take_damage(bdmg // 2)
            boss_data["message"] += f" Hydra lashes twice! {bdmg} and {bdmg // 2} damage!"
        elif boss_idx == 1:  # Golem
            boss_data["boss_ability"] = "shielded"
            boss_data["message"] += " Golem shields itself (half damage next turn)!"
        elif boss_idx == 2:  # Drake
            bdmg = random.randint(4, 8) + boss_strength
            player.take_damage(bdmg)
            boss_data["message"] += f" Drake breathes fire! {bdmg} damage!"
        boss_data["boss_ability_cd"] = 3

    # Boss attack
    if boss_data["boss_cur_health"] > 0:
        if player.block_next:
            boss_data["message"] += " You blocked the boss's attack!"
            player.block_next = False
        else:
            bdmg = random.randint(3, 6) + boss_data["boss_strength"]
            if boss_data["boss_ability"] == "shielded":
                bdmg //= 2
                boss_data["boss_ability"] = None
            player.take_damage(bdmg)
            boss_data["message"] += f" Boss hits you for {bdmg}!"

    # Regenerate mana
    player.mana = min(player.max_mana, player.mana + 1)

    # Check win/lose conditions
    if boss_data["boss_cur_health"] <= 0:
        player.bosses_defeated += 1
        game.state = "playing"
        return True
    elif player.health <= 0:
        game.state = "gameover"
        return False

    return False


def draw_boss_battle(game):
    """Draw boss battle screen using Engine.

    Args:
        game: The Game instance with boss_data and engine
    """
    if not game.engine:
        return

    boss_data = game.boss_data
    player = boss_data["player"]

    # Clear screen
    game.engine.cls(0)

    # Draw boss sprite (simple rectangle for boss)
    boss_x = game.WINDOW_WIDTH // 2 - 16
    boss_y = 60
    draw_boss_sprite(game.engine, boss_x, boss_y, boss_data["boss_idx"])

    # Draw boss name
    boss_name_x = game.WINDOW_WIDTH // 2 - len(boss_data["boss_name"]) * 2
    game.engine.text(boss_name_x, 40, boss_data["boss_name"], 7)

    # Draw health bars
    # Boss health bar background
    boss_hp_percent = max(0, boss_data["boss_cur_health"] / boss_data["boss_max_health"])
    boss_hp_width = int(100 * boss_hp_percent)
    game.engine.rect(78, 120, 100, 8, 1)  # Background (dark blue)
    game.engine.rect(78, 120, boss_hp_width, 8, 8)  # Health bar (red)
    game.engine.text(80, 130, f"Boss HP: {max(0, boss_data['boss_cur_health'])}", 7)

    # Player health bar
    player_hp_percent = max(0, player.health / player.max_health)
    player_hp_width = int(100 * player_hp_percent)
    game.engine.rect(78, 150, 100, 8, 1)  # Background
    game.engine.rect(78, 150, player_hp_width, 8, 11)  # Health bar (green)
    game.engine.text(80, 160, f"Your HP: {player.health}  Mana: {player.mana}", 7)

    # Draw message
    message_x = max(10, game.WINDOW_WIDTH // 2 - len(boss_data["message"]) * 2)
    game.engine.text(message_x, 180, boss_data["message"], 7)

    # Draw controls
    game.engine.text(80, 200, "[A]ttack  [S]pell  [ESC]Flee", 7)


def draw_boss_sprite(engine, x, y, boss_type=0, size=32):
    """Draw boss sprite using Engine primitives.

    Args:
        engine: The Engine instance
        x: X position
        y: Y position
        boss_type: Type of boss (0=Hydra, 1=Golem, 2=Drake)
        size: Size of the sprite
    """
    if boss_type == 0:  # Dread Hydra
        # Three heads (circles approximated with rects)
        engine.rect(x + 4, y + 4, 8, 8, 8)  # Left head (red)
        engine.rect(x + 12, y, 8, 8, 8)  # Center head (red)
        engine.rect(x + 20, y + 4, 8, 8, 8)  # Right head (red)
        # Body
        engine.rect(x + 8, y + 12, 16, 10, 5)  # Dark gray body

    elif boss_type == 1:  # Shadow Golem
        # Large rectangular body
        engine.rect(x + 4, y + 4, 24, 20, 5)  # Dark gray body
        # Arms
        engine.rect(x, y + 8, 6, 8, 5)  # Left arm
        engine.rect(x + 26, y + 8, 6, 8, 5)  # Right arm
        # Eyes (glowing)
        engine.rect(x + 10, y + 10, 3, 3, 8)  # Left eye (red)
        engine.rect(x + 19, y + 10, 3, 3, 8)  # Right eye (red)

    elif boss_type == 2:  # Chaos Drake
        # Dragon head
        engine.rect(x + 10, y, 12, 10, 8)  # Red head
        # Body
        engine.rect(x + 8, y + 10, 16, 8, 8)  # Red body
        # Wings
        engine.rect(x, y + 8, 10, 6, 5)  # Left wing (gray)
        engine.rect(x + 22, y + 8, 10, 6, 5)  # Right wing (gray)
        # Eyes
        engine.rect(x + 12, y + 4, 2, 2, 10)  # Left eye (yellow)
        engine.rect(x + 18, y + 4, 2, 2, 10)  # Right eye (yellow)
