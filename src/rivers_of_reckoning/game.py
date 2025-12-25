"""Game module for Rivers of Reckoning.

This module provides the main Game class that orchestrates the RPG gameplay
using pygame-ce via the Engine abstraction layer.

The game is fully procedurally generated using OpenSimplex noise for
natural terrain, biomes, weather, and day/night cycles.
"""

import random
from .player import Player
from .enemy import Enemy
from .map_data import MAP_SIZE, EVENT_TYPES
from .engine import Engine, LOGICAL_WIDTH, LOGICAL_HEIGHT
from .systems import create_game_world
from .world_gen import BIOME_CONFIGS, BiomeType, TileType

# Event message display duration (frames at 60 FPS = 3 seconds)
EVENT_MESSAGE_DURATION = 180


class Game:
    """Rivers of Reckoning - Fully Procedural RPG

    All terrain, enemies, weather, and events are procedurally generated
    using noise functions and ECS architecture inspired by Otterfall.

    The game uses responsive auto-scaling via pygame.SCALED for
    seamless web deployment through pygbag.
    """

    def __init__(self, test_mode=False):
        # Use logical dimensions from engine
        self.WINDOW_WIDTH = LOGICAL_WIDTH
        self.WINDOW_HEIGHT = LOGICAL_HEIGHT

        # Initialize responsive Engine (auto-scales to any screen)
        if not test_mode:
            self.engine = Engine()
        else:
            self.engine = None

        # Game state
        self.running = True
        self.state = "title"  # 'title', 'playing', 'paused', 'gameover', 'boss'

        # ECS World for systems
        self.ecs_world = None
        self.time_entity = None
        self.weather_entity = None

        # Game objects
        self.player = None
        self.map = None
        self.enemies = []
        self.event_message = None
        self.event_timer = 0
        self.boss_data = None

        # Branding: "The Reckoning" unique mechanics
        self.reckoning_level = 0
        self.reckoning_timer = 0
        self.reckoning_threshold = 1000  # When it hits this, danger increases

        # Title screen animation
        self.title_frame = 0

        # Game statistics
        self.distance_traveled = 0
        self.enemies_defeated = 0
        self.current_biome = BiomeType.MARSH

        # Colors (16-color palette)
        self.colors = {
            "bg": 0,        # Black
            "text": 7,      # White
            "player": 8,    # Red
            "enemy": 10,    # Yellow/Green
            "ui": 6,        # Light Blue
            "highlight": 11,  # Light Green
            "warning": 8,   # Red
            "success": 3,   # Dark Green
        }

    def update(self):
        """Main update loop"""
        if not self.running:
            return

        if self.state == "title":
            self.update_title()
        elif self.state == "playing":
            self.update_playing()
        elif self.state == "paused":
            self.update_paused()
        elif self.state == "gameover":
            self.update_gameover()

    def draw(self):
        """Main draw loop"""
        if self.engine:
            self.engine.cls(self.colors["bg"])

            if self.state == "title":
                self.draw_title()
            elif self.state == "playing":
                self.draw_playing()
            elif self.state == "paused":
                self.draw_paused()
            elif self.state == "gameover":
                self.draw_gameover()

    def update_title(self):
        """Handle title screen state"""
        if not self.engine:
            return

        self.title_frame += 1

        if self.engine.btnp("enter") or self.engine.btnp("space"):
            self.start_game()
            self.state = "playing"
        elif self.engine.btnp("escape"):
            self.running = False

    def draw_title(self):
        """Draw procedural title screen with branding flair"""
        if not self.engine:
            return

        # Atmospheric background: procedural "river" flow
        for i in range(10):
            y = 80 + i * 15
            offset = int(10 * random.random() + self.title_frame * 0.5) % 256
            self.engine.line(0, y, 256, y, 1)  # Dark water lines
            # Random "froth" particles
            if self.title_frame % 5 == 0:
                froth_x = (i * 40 + self.title_frame * 2) % 256
                self.engine.rect(froth_x, y, 2, 1, 7)

        # Main Title with "Reckoning" red highlight
        title_x = self.WINDOW_WIDTH // 2 - 75
        self.engine.text(title_x, 40, "RIVERS OF", self.colors["text"])
        self.engine.text(title_x + 65, 40, "RECKONING", 8)  # Reckoning Red

        # Subtitle with misty color
        self.engine.text(
            self.WINDOW_WIDTH // 2 - 60, 60,
            "The Saga of Rivers Begins...", 6
        )

        # Visual Divider
        self.engine.line(40, 80, 216, 80, 7)

        # Features list with themed icons
        features = [
            "~ The Flow of Fate",
            "~ The Iron Woods & Frozen Veil",
            "~ The Global Reckoning Meter",
            "~ Tactical Destiny Navigation",
            "~ Perma-death Saga Survival",
        ]
        for i, feature in enumerate(features):
            col = 11 if (self.title_frame // 30) % len(features) == i else 3
            self.engine.text(45, 100 + i * 14, feature, col)

        # Instructions with pulse effect
        pulse = 7 if (self.title_frame // 20) % 2 == 0 else 6
        self.engine.text(
            self.WINDOW_WIDTH // 2 - 50, 200,
            "PRESS START [ENTER]", pulse
        )
        self.engine.text(
            self.WINDOW_WIDTH // 2 - 40, 220,
            "QUIT [ESC]", self.colors["ui"]
        )

        # Standalone Branding
        self.engine.text(5, 240, "Genesis: Curses 1.0", 5)
        self.engine.text(180, 240, "Python 2.5D Legend", 12)

    def start_game(self):
        """Initialize fully procedural game world"""
        # Initialize ECS world with all systems
        self.ecs_world = create_game_world()

        # Create player
        self.player = Player("Normal")

        # Create procedural map with random seed
        from .map import Map
        seed = random.randint(1, 999999)
        self.map = Map(seed=seed)

        # Center camera on player spawn
        self.map.update_camera(self.player.x, self.player.y)

        # Reset game state
        self.enemies = []
        self.event_message = None
        self.distance_traveled = 0
        self.enemies_defeated = 0

    def update_playing(self):
        """Handle playing state with procedural systems"""
        if not self.engine:
            return

        if self.engine.btnp("escape"):
            self.state = "paused"
            return

        # Update Reckoning: slowly increases over time and distance
        self.reckoning_timer += 1
        if self.reckoning_timer % 60 == 0:
            self.reckoning_level += 1
            
            # Check for Reckoning Surge (every 100 levels)
            if self.reckoning_level > 0 and self.reckoning_level % 100 == 0:
                self._trigger_reckoning_surge()

        # Update ECS systems
        if self.ecs_world:
            self.ecs_world.process(1 / 60)

        # Handle movement
        dx, dy = 0, 0
        if self.engine.btnp("up"):
            dy = -1
        elif self.engine.btnp("down"):
            dy = 1
        elif self.engine.btnp("left"):
            dx = -1
        elif self.engine.btnp("right"):
            dx = 1

        if dx != 0 or dy != 0:
            self.move_player(dx, dy)

        # Clear event message after some time
        if self.event_message and self.event_timer > 0:
            self.event_timer -= 1
            if self.event_timer <= 0:
                self.event_message = None

    def move_player(self, dx, dy):
        """Move player through procedural world with unique flow effects"""
        new_x = self.player.x + dx
        new_y = self.player.y + dy

        if self.map.is_walkable(new_x, new_y):
            self.player.move(dx, dy, wrap=False)
            self.distance_traveled += 1

            # Unique Mechanic: The Flow of Fate
            # If player is in water (Fate), they get pushed by the current
            tile_type, _ = self.map.world.get_tile(self.player.x, self.player.y)
            if tile_type == TileType.WATER:
                fdx, fdy = self.map.world.get_water_flow(self.player.x, self.player.y)
                if self.map.is_walkable(self.player.x + fdx, self.player.y + fdy):
                    self.player.move(fdx, fdy, wrap=False)
                    # No extra distance for flow movement
                    if self.event_timer <= 0:
                        self.event_message = "[FATE] A current pulls at your destiny..."
                        self.event_timer = 30  # Short message

            # Update camera to follow player
            self.map.update_camera(self.player.x, self.player.y)

            # Update current biome
            self.current_biome = self.map.get_current_biome()

            # Trigger procedural random events based on biome
            event_chance = 0.15
            if random.random() < event_chance:
                self._trigger_random_event()

            # Trigger enemy encounters based on biome spawn rate
            spawn_chance = self.map.get_spawn_chance(self.player.x, self.player.y)
            if random.random() < spawn_chance * 0.3:  # Scale down base rate
                self._trigger_enemy_encounter()

            if self.player.health <= 0:
                self.state = "gameover"

    def _trigger_reckoning_surge(self):
        """A major event where the world actively strikes back"""
        if self.engine:
            self.engine.shake(10, 60)  # Violent shake
        
        surge_types = [
            "FATE AWAKENS!",
            "THE WORLD RECKONS!",
            "DESTINY OVERFLOWS!",
            "A SURGE OF LEGEND!",
        ]
        msg = random.choice(surge_types)
        self.event_message = f"!!! {msg} !!!"
        self.event_timer = EVENT_MESSAGE_DURATION * 2
        
        # Immediate consequence
        penalty = 5 + (self.reckoning_level // 200)
        self.player.take_damage(penalty)
        self.enemies_defeated += 5  # "Ghost" enemies defeated by the surge

    def _trigger_random_event(self):
        """Trigger a random event based on current biome"""
        biome_config = BIOME_CONFIGS.get(self.current_biome)
        if not biome_config:
            return

        # Biome-specific events
        event = random.choice(EVENT_TYPES)
        self.event_message = f"[{biome_config.name}] {event['desc']}"
        self.event_timer = EVENT_MESSAGE_DURATION
        
        # Juice: Small shake for events
        if self.engine:
            self.engine.shake(2, 10)

        if event["effect"]:
            event["effect"](self.player)

    def _trigger_enemy_encounter(self):
        """Trigger an enemy encounter based on biome"""
        biome_config = BIOME_CONFIGS.get(self.current_biome)

        # Scale enemy strength by distance traveled and Reckoning level
        base_strength = 1 + (self.distance_traveled // 50) + (self.reckoning_level // 100)
        strength = random.randint(base_strength, base_strength + 2)

        enemy = Enemy(strength=min(strength, 10))  # Cap at 10
        dmg = random.randint(1, enemy.strength)
        self.player.take_damage(dmg)

        # Juice: HEAVY shake for combat
        if self.engine:
            self.engine.shake(6, 20)

        biome_name = biome_config.name if biome_config else "Unknown"
        self.event_message = f"[{biome_name}] {enemy.name} attacks! -{dmg} HP"
        self.event_timer = EVENT_MESSAGE_DURATION
        self.enemies_defeated += 1

    def draw_playing(self):
        """Draw playing state with procedural world"""
        if not self.engine:
            return

        # Draw procedural map
        self.map.draw(self.engine)

        # Draw player at screen center (camera follows player)
        center_x = (MAP_SIZE // 2) * (self.WINDOW_WIDTH // MAP_SIZE)
        center_y = (MAP_SIZE // 2) * (self.WINDOW_HEIGHT // MAP_SIZE) + 20
        tile_size = self.WINDOW_WIDTH // MAP_SIZE
        
        # 2.5D Player Shadow
        self.engine.rect(center_x + 2, center_y + tile_size - 2, tile_size - 4, 2, 0)
        # Player Sprite
        self.engine.rect(center_x, center_y, tile_size, tile_size, self.colors["player"])

        # Draw HUD
        self.draw_enhanced_hud()

        # Draw event message if active
        if self.event_message:
            self.draw_event_message()

    def draw_enhanced_hud(self):
        """Draw unique Rivers of Reckoning HUD"""
        if not self.engine:
            return

        # Top Background Panel
        self.engine.rect(0, 0, self.WINDOW_WIDTH, 28, 1)  # Dark Water background
        self.engine.line(0, 28, self.WINDOW_WIDTH, 28, 7)  # Froth border

        # Health Bar - Branded
        self.engine.text(5, 4, "RIVERS", 7)
        self.engine.bar(45, 5, 60, 8, self.player.health, self.player.max_health, 8, 0)

        # RECKONING Meter - Unique Mechanic
        self.engine.text(115, 4, "DESTINY", 14)  # Pink/Purple highlight
        reck_progress = self.reckoning_level % 100
        self.engine.bar(175, 5, 75, 8, reck_progress, 100, 14, 0)

        # Sub-stats row
        biome_config = BIOME_CONFIGS.get(self.current_biome)
        biome_name = biome_config.name if biome_config else "???"
        self.engine.text(5, 16, f"BIOME: {biome_name}", 11)
        self.engine.text(115, 16, f"GOLD: {self.player.gold}", 10)
        self.engine.text(180, 16, f"DIST: {self.distance_traveled}", 6)

        # Bottom Info Bar
        self.engine.rect(0, self.WINDOW_HEIGHT - 12, self.WINDOW_WIDTH, 12, 0)
        self.engine.line(0, self.WINDOW_HEIGHT - 12, self.WINDOW_WIDTH, self.WINDOW_HEIGHT - 12, 6)
        self.engine.text(
            5, self.WINDOW_HEIGHT - 10,
            f"REGION: {self.player.x // 100}:{self.player.y // 100}  |  LVL: {self.player.level}",
            6
        )

    def draw_event_message(self):
        """Draw event message dialog"""
        if not self.engine:
            return

        # Calculate message box size
        msg_lines = []
        if len(self.event_message) > 30:
            # Split long messages
            words = self.event_message.split()
            line = ""
            for word in words:
                if len(line + word) > 30:
                    msg_lines.append(line)
                    line = word + " "
                else:
                    line += word + " "
            if line:
                msg_lines.append(line)
        else:
            msg_lines.append(self.event_message)

        # Draw message box
        msg_height = len(msg_lines) * 10 + 20
        msg_y = self.WINDOW_HEIGHT // 2 - msg_height // 2

        self.engine.rect(20, msg_y, 216, msg_height, self.colors["ui"])
        self.engine.rectb(20, msg_y, 216, msg_height, self.colors["text"])

        # Draw message text
        for i, line in enumerate(msg_lines):
            self.engine.text(25, msg_y + 10 + i * 10, line, self.colors["text"])

    def update_paused(self):
        """Handle paused state"""
        if not self.engine:
            return

        if self.engine.btnp("escape"):
            self.state = "playing"
        elif self.engine.btnp("q"):
            self.state = "title"

    def draw_paused(self):
        """Draw paused state"""
        if not self.engine:
            return

        # Draw the game state first
        self.draw_playing()

        # Draw pause overlay
        self.engine.rect(60, 100, 136, 60, self.colors["ui"])
        self.engine.rectb(60, 100, 136, 60, self.colors["text"])

        self.engine.text(100, 110, "PAUSED", self.colors["text"])
        self.engine.text(70, 130, "ESC: Resume", self.colors["text"])
        self.engine.text(70, 140, "Q: Quit to Menu", self.colors["text"])

    def update_gameover(self):
        """Handle game over state"""
        if not self.engine:
            return

        if self.engine.btnp("space"):
            self.state = "title"
        elif self.engine.btnp("escape"):
            self.running = False

    def draw_gameover(self):
        """Draw game over state with exploration stats"""
        if not self.engine:
            return

        self.engine.text(
            self.WINDOW_WIDTH // 2 - 30,
            self.WINDOW_HEIGHT // 2 - 50,
            "GAME OVER",
            self.colors["warning"],
        )

        # Show final stats from procedural exploration
        stats = [
            f"Distance: {self.distance_traveled}",
            f"Enemies: {self.enemies_defeated}",
            f"Gold: {self.player.gold}",
            f"Score: {self.player.score}",
        ]
        for i, stat in enumerate(stats):
            self.engine.text(
                self.WINDOW_WIDTH // 2 - 40,
                self.WINDOW_HEIGHT // 2 - 20 + i * 12,
                stat,
                self.colors["ui"],
            )

        self.engine.text(
            self.WINDOW_WIDTH // 2 - 50,
            self.WINDOW_HEIGHT // 2 + 40,
            "SPACE: New World",
            self.colors["text"],
        )
        self.engine.text(
            self.WINDOW_WIDTH // 2 - 35,
            self.WINDOW_HEIGHT // 2 + 55,
            "ESC: Quit",
            self.colors["ui"],
        )
