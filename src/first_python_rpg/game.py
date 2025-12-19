import random
import asyncio
from .player import Player
from .enemy import Enemy
from .map_data import MAP_SIZE, EVENT_TYPES
from .engine import Engine
# Remove Pyxel specific enhancements imports for now or mock them
# from .pyxel_enhancements import ...


class Game:
    """First Python RPG Game - Pygame-ce Edition"""

    def __init__(self, test_mode=False):
        # Engine configuration
        self.WINDOW_WIDTH = 256  # Logical width
        self.WINDOW_HEIGHT = 256

        # Initialize Engine
        if not test_mode:
            self.engine = Engine(960, 960, "First Python RPG")
        else:
            self.engine = None

        # Game state
        self.running = True
        self.state = "feature_select"  # 'feature_select', 'playing', 'paused', 'gameover'

        # Enhanced features
        self.features = {
            "random_events": False,
            "difficulty_levels": False,
            "enemy_encounters": False,
            "procedural_dungeons": False,
            "dynamic_quests": False,
            "weather_system": False,
            "particle_effects": False,
        }
        self.selected_feature = 0
        self.feature_names = [
            ("Random Events", "random_events"),
            ("Difficulty Levels", "difficulty_levels"),
            ("Enemy Encounters", "enemy_encounters"),
            ("Procedural Dungeons", "procedural_dungeons"),
            ("Dynamic Quests", "dynamic_quests"),
            ("Weather System", "weather_system"),
            ("Particle Effects", "particle_effects"),
        ]

        # Game objects
        self.player = None
        self.map = None
        self.enemies = []
        self.event_message = None
        self.event_timer = 0
        self.boss_data = None  # For boss battle state
        self.enemies = []
        self.map = None
        self.event_message = None
        self.event_timer = 0

        # UI state
        self.show_quest_ui = False
        self.show_weather_ui = False

        # Colors (using Pyxel's 16-color palette mapped in Engine)
        self.colors = {
            "bg": 0,  # Black
            "text": 7,  # White
            "player": 8,  # Red
            "enemy": 10,  # Green
            "ui": 6,  # Light Blue
            "highlight": 11,  # Light Green
            "warning": 8,  # Red
            "success": 3,  # Green
        }

    def update(self):
        """Main update loop"""
        if not self.running:
            return

        if self.state == "feature_select":
            self.update_feature_select()
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

            if self.state == "feature_select":
                self.draw_feature_select()
            elif self.state == "playing":
                self.draw_playing()
            elif self.state == "paused":
                self.draw_paused()
            elif self.state == "gameover":
                self.draw_gameover()

    def update_feature_select(self):
        """Handle feature selection state"""
        if not self.engine: return

        if self.engine.btnp("up"):
            self.selected_feature = (self.selected_feature - 1) % len(
                self.feature_names
            )
        elif self.engine.btnp("down"):
            self.selected_feature = (self.selected_feature + 1) % len(
                self.feature_names
            )
        elif self.engine.btnp("space"):
            # Toggle selected feature
            feature_name = self.feature_names[self.selected_feature][1]
            self.features[feature_name] = not self.features[feature_name]
        elif self.engine.btnp("enter"):
            # Start game
            self.start_game()
            self.state = "playing"
        elif self.engine.btnp("escape"):
            self.running = False

    def draw_feature_select(self):
        """Draw enhanced feature selection screen"""
        self.engine.text(self.WINDOW_WIDTH // 2 - 35, 15, "RPG ENHANCED", self.colors["text"])
        self.engine.text(
            self.WINDOW_WIDTH // 2 - 30, 25, "FEATURE SELECT", self.colors["text"]
        )

        for i, (display_name, feature_name) in enumerate(self.feature_names):
            y = 45 + i * 15
            color = (
                self.colors["highlight"]
                if i == self.selected_feature
                else self.colors["text"]
            )
            status = "ON" if self.features[feature_name] else "OFF"

            # Show feature name
            self.engine.text(10, y, display_name, color)
            # Show status
            status_color = (
                self.colors["success"]
                if self.features[feature_name]
                else self.colors["warning"]
            )
            self.engine.text(180, y, status, status_color)

        # Instructions
        self.engine.text(10, 180, "UP/DOWN: Select", self.colors["ui"])
        self.engine.text(10, 190, "SPACE: Toggle", self.colors["ui"])
        self.engine.text(10, 200, "ENTER: Start", self.colors["ui"])
        self.engine.text(10, 210, "ESC: Quit", self.colors["ui"])

    def start_game(self):
        """Initialize game objects with enhanced features"""
        difficulty = "Easy"  # Default difficulty
        if self.features["difficulty_levels"]:
            difficulty = "Hard"

        self.player = Player(difficulty)

        # Create map
        from .map import Map
        self.map = Map(procedural=self.features.get("procedural_map", False))

        self.enemies = []
        self.event_message = None

    def update_playing(self):
        """Handle playing state with enhanced features"""
        if not self.engine: return

        if self.engine.btnp("escape"):
            self.state = "paused"
            return

        # Toggle quest UI
        if self.engine.btnp("q"):
            self.show_quest_ui = not self.show_quest_ui

        # Toggle weather UI
        if self.engine.btnp("w"):
            self.show_weather_ui = not self.show_weather_ui

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
        """Move player and handle enhanced events"""
        new_x = self.player.x + dx
        new_y = self.player.y + dy

        if self.map.is_walkable(new_x, new_y):
            self.player.move(dx, dy, wrap=True)

            # Trigger random event if enabled
            if self.features["random_events"] and random.random() < 0.2:
                event = random.choice(EVENT_TYPES)
                self.event_message = event["desc"]
                self.event_timer = 180  # 3 seconds at 60 FPS
                if event["effect"]:
                    event["effect"](self.player)
                if self.player.health <= 0:
                    self.state = "gameover"

            # Trigger enemy encounter if enabled
            elif self.features["enemy_encounters"] and random.random() < 0.2:
                enemy = Enemy(strength=random.randint(1, 3))
                dmg = random.randint(1, enemy.strength)
                self.player.take_damage(dmg)

                self.event_message = f"Enemy Encounter! Took {dmg} damage from a {enemy.name}."
                self.event_timer = 180
                if self.player.health <= 0:
                    self.state = "gameover"

    def draw_playing(self):
        """Draw playing state with enhanced features"""
        if not self.engine: return

        # Draw map
        self.map.draw(self.engine)

        player_x = self.player.x * (self.WINDOW_WIDTH // MAP_SIZE)
        player_y = self.player.y * (self.WINDOW_HEIGHT // MAP_SIZE) + 20
        tile_size = self.WINDOW_WIDTH // MAP_SIZE
        self.engine.rect(player_x, player_y, tile_size, tile_size, self.colors["player"])

        # Draw HUD
        self.draw_enhanced_hud()

        # Draw event message if active
        if self.event_message:
            self.draw_event_message()

    def draw_enhanced_hud(self):
        """Draw enhanced heads-up display"""
        if not self.engine: return

        # Background bar
        self.engine.rect(0, 0, self.WINDOW_WIDTH, 20, self.colors["ui"])

        # Health
        self.engine.text(5, 5, f"HP: {self.player.health}", self.colors["text"])

        # Gold
        self.engine.text(60, 5, f"Gold: {self.player.gold}", self.colors["text"])

        # Mana
        self.engine.text(120, 5, f"Mana: {self.player.mana}", self.colors["text"])

    def draw_event_message(self):
        """Draw event message dialog"""
        if not self.engine: return

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
        if not self.engine: return

        if self.engine.btnp("escape"):
            self.state = "playing"
        elif self.engine.btnp("q"):
            self.state = "feature_select"

    def draw_paused(self):
        """Draw paused state"""
        if not self.engine: return

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
        if not self.engine: return

        if self.engine.btnp("space"):
            self.state = "feature_select"
        elif self.engine.btnp("escape"):
            self.running = False

    def draw_gameover(self):
        """Draw game over state"""
        if not self.engine: return

        self.engine.text(
            self.WINDOW_WIDTH // 2 - 30,
            self.WINDOW_HEIGHT // 2 - 30,
            "GAME OVER",
            self.colors["text"],
        )

        # Show final stats
        self.engine.text(
            self.WINDOW_WIDTH // 2 - 40,
            self.WINDOW_HEIGHT // 2 - 10,
            f"Final Gold: {self.player.gold}",
            self.colors["ui"],
        )
        self.engine.text(
            self.WINDOW_WIDTH // 2 - 40,
            self.WINDOW_HEIGHT // 2,
            f"Final Score: {self.player.score}",
            self.colors["ui"],
        )

        self.engine.text(
            self.WINDOW_WIDTH // 2 - 40,
            self.WINDOW_HEIGHT // 2 + 20,
            "SPACE: Menu",
            self.colors["ui"],
        )
        self.engine.text(
            self.WINDOW_WIDTH // 2 - 30,
            self.WINDOW_HEIGHT // 2 + 30,
            "ESC: Quit",
            self.colors["ui"],
        )

    def run(self):
        """Run the game loop"""
        if self.engine:
            asyncio.run(self.engine.run(self.update, self.draw))
