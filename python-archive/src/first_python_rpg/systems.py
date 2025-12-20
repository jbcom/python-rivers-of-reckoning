"""ECS Systems for Rivers of Reckoning.

Uses esper for Entity Component System architecture.
Inspired by Otterfall's system design.

Note: esper 3.x uses module-level functions instead of a World class.
This module provides a lightweight wrapper for game systems.
"""

import esper
import random
import math
from dataclasses import dataclass
from enum import Enum, auto


# =============================================================================
# COMPONENTS (pure data)
# =============================================================================

class TimePhase(Enum):
    DAWN = auto()
    DAY = auto()
    DUSK = auto()
    NIGHT = auto()


class WeatherType(Enum):
    CLEAR = auto()
    RAIN = auto()
    FOG = auto()
    SNOW = auto()
    STORM = auto()


@dataclass
class Position:
    """2D position in the world."""
    x: float = 0.0
    y: float = 0.0


@dataclass
class Velocity:
    """Movement velocity."""
    dx: float = 0.0
    dy: float = 0.0
    max_speed: float = 1.0


@dataclass
class Health:
    """Health for damageable entities."""
    current: int = 10
    maximum: int = 10
    regen_rate: float = 0.0  # HP per second


@dataclass
class Stamina:
    """Stamina for actions."""
    current: float = 100.0
    maximum: float = 100.0
    regen_rate: float = 5.0  # Per second


@dataclass
class Combat:
    """Combat statistics."""
    attack_damage: int = 2
    armor: float = 0.0      # Damage reduction (0-1)
    dodge_chance: float = 0.1
    attack_cooldown: float = 0.0
    is_attacking: bool = False


@dataclass
class PlayerTag:
    """Identifies the player entity."""
    gold: int = 0
    score: int = 0
    level: int = 1
    experience: int = 0
    exp_to_next: int = 10
    mana: int = 5
    max_mana: int = 5


@dataclass
class EnemyTag:
    """Identifies enemy entities with AI state."""
    name: str = "Goblin"
    state: str = "idle"  # idle, wandering, chasing, attacking, fleeing
    detection_range: float = 5.0
    attack_range: float = 1.5
    is_boss: bool = False
    wander_timer: float = 0.0


@dataclass
class Renderable:
    """Visual rendering data."""
    color: int = 8  # Color palette index
    size: int = 1   # Tile size multiplier
    visible: bool = True
    sprite_id: str = "default"


@dataclass
class TimeOfDay:
    """Global time system (singleton component)."""
    hour: float = 6.0       # 0-24
    phase: TimePhase = TimePhase.DAWN
    time_scale: float = 60.0  # Game seconds per real second
    day_count: int = 1


@dataclass
class Weather:
    """Global weather system (singleton component)."""
    current: WeatherType = WeatherType.CLEAR
    intensity: float = 0.5   # 0-1
    duration: float = 300.0  # Seconds remaining
    wind_speed: float = 0.0
    wind_angle: float = 0.0  # Radians


@dataclass
class WorldState:
    """Global world state (singleton component)."""
    current_biome: str = "marsh"
    difficulty: float = 1.0
    enemies_defeated: int = 0
    bosses_defeated: int = 0
    distance_traveled: float = 0.0


# =============================================================================
# SYSTEMS (using esper 3.x module-level API)
# =============================================================================

class MovementProcessor(esper.Processor):
    """Handles entity movement based on velocity."""

    def __init__(self, world_gen=None):
        self.world_gen = world_gen

    def process(self, dt: float = 1 / 60):
        """Update positions based on velocity."""
        for ent, (pos, vel) in esper.get_components(Position, Velocity):
            new_x = pos.x + vel.dx * dt
            new_y = pos.y + vel.dy * dt

            if self.world_gen is not None:
                if self.world_gen.is_walkable(int(new_x), int(new_y)):
                    pos.x = new_x
                    pos.y = new_y
            else:
                pos.x = new_x
                pos.y = new_y

            vel.dx *= 0.9
            vel.dy *= 0.9


class TimeProcessor(esper.Processor):
    """Manages the day/night cycle."""

    def process(self, dt: float = 1 / 60):
        """Update time of day."""
        for ent, (time,) in esper.get_components(TimeOfDay):
            time.hour += (dt * time.time_scale) / 3600

            if time.hour >= 24:
                time.hour -= 24
                time.day_count += 1

            if 5 <= time.hour < 7:
                time.phase = TimePhase.DAWN
            elif 7 <= time.hour < 18:
                time.phase = TimePhase.DAY
            elif 18 <= time.hour < 20:
                time.phase = TimePhase.DUSK
            else:
                time.phase = TimePhase.NIGHT


class WeatherProcessor(esper.Processor):
    """Manages weather changes."""

    def __init__(self):
        self.transition_speed = 0.1

    def process(self, dt: float = 1 / 60):
        """Update weather state."""
        for ent, (weather,) in esper.get_components(Weather):
            weather.duration -= dt

            if weather.duration <= 0:
                self._change_weather(weather)

            weather.wind_angle += random.uniform(-0.1, 0.1) * dt
            weather.wind_speed = max(0, weather.wind_speed + random.uniform(-0.5, 0.5) * dt)

    def _change_weather(self, weather: Weather):
        """Transition to new weather."""
        choices = [
            (WeatherType.CLEAR, 0.5),
            (WeatherType.RAIN, 0.2),
            (WeatherType.FOG, 0.15),
            (WeatherType.SNOW, 0.1),
            (WeatherType.STORM, 0.05),
        ]

        total = sum(w for _, w in choices)
        r = random.random() * total
        cumulative = 0
        for weather_type, weight in choices:
            cumulative += weight
            if r <= cumulative:
                weather.current = weather_type
                break

        weather.duration = random.uniform(60, 300)
        weather.intensity = random.uniform(0.3, 1.0)

        if weather.current == WeatherType.STORM:
            weather.wind_speed = random.uniform(3, 6)
        elif weather.current == WeatherType.RAIN:
            weather.wind_speed = random.uniform(1, 3)
        else:
            weather.wind_speed = random.uniform(0, 1)


class CombatProcessor(esper.Processor):
    """Handles combat between entities."""

    def process(self, dt: float = 1 / 60):
        """Update combat state."""
        for ent, (combat,) in esper.get_components(Combat):
            if combat.attack_cooldown > 0:
                combat.attack_cooldown -= dt


class AIProcessor(esper.Processor):
    """Simple AI for enemies."""

    def process(self, dt: float = 1 / 60):
        """Update enemy AI."""
        player_pos = None
        for ent, (pos, player) in esper.get_components(Position, PlayerTag):
            player_pos = pos
            break

        if player_pos is None:
            return

        for ent, (pos, vel, enemy) in esper.get_components(Position, Velocity, EnemyTag):
            dist_to_player = math.sqrt(
                (pos.x - player_pos.x) ** 2 +
                (pos.y - player_pos.y) ** 2
            )

            if enemy.state == "idle":
                if dist_to_player < enemy.detection_range:
                    enemy.state = "chasing"
                elif random.random() < 0.01:
                    enemy.state = "wandering"
                    enemy.wander_timer = random.uniform(2, 5)

            elif enemy.state == "wandering":
                enemy.wander_timer -= dt
                if enemy.wander_timer <= 0:
                    enemy.state = "idle"
                    vel.dx = 0
                    vel.dy = 0
                elif random.random() < 0.1:
                    vel.dx = random.uniform(-1, 1) * vel.max_speed
                    vel.dy = random.uniform(-1, 1) * vel.max_speed

                if dist_to_player < enemy.detection_range:
                    enemy.state = "chasing"

            elif enemy.state == "chasing":
                if dist_to_player > enemy.detection_range * 1.5:
                    enemy.state = "idle"
                    vel.dx = 0
                    vel.dy = 0
                elif dist_to_player < enemy.attack_range:
                    enemy.state = "attacking"
                    vel.dx = 0
                    vel.dy = 0
                else:
                    dx = player_pos.x - pos.x
                    dy = player_pos.y - pos.y
                    length = math.sqrt(dx * dx + dy * dy)
                    if length > 0:
                        vel.dx = (dx / length) * vel.max_speed
                        vel.dy = (dy / length) * vel.max_speed

            elif enemy.state == "attacking":
                if dist_to_player > enemy.attack_range:
                    enemy.state = "chasing"


class HealthRegenProcessor(esper.Processor):
    """Regenerates health over time."""

    def process(self, dt: float = 1 / 60):
        """Update health regeneration."""
        for ent, (health,) in esper.get_components(Health):
            if health.regen_rate > 0 and health.current < health.maximum:
                health.current = min(
                    health.maximum,
                    health.current + health.regen_rate * dt
                )


class StaminaRegenProcessor(esper.Processor):
    """Regenerates stamina over time."""

    def process(self, dt: float = 1 / 60):
        """Update stamina regeneration."""
        for ent, (stamina,) in esper.get_components(Stamina):
            if stamina.current < stamina.maximum:
                stamina.current = min(
                    stamina.maximum,
                    stamina.current + stamina.regen_rate * dt
                )


class GameWorld:
    """Wrapper for esper ECS to manage game systems.

    Provides a simple interface for the game to interact with ECS.
    """

    def __init__(self):
        """Initialize the game world with all systems."""
        # Clear any existing state
        esper.clear_database()

        # Add processors in execution order
        esper.add_processor(MovementProcessor())
        esper.add_processor(TimeProcessor())
        esper.add_processor(WeatherProcessor())
        esper.add_processor(AIProcessor())
        esper.add_processor(CombatProcessor())
        esper.add_processor(HealthRegenProcessor())
        esper.add_processor(StaminaRegenProcessor())

        # Create singleton entities for global state
        esper.create_entity(TimeOfDay(hour=8.0, phase=TimePhase.DAY))
        esper.create_entity(Weather(current=WeatherType.CLEAR, duration=120.0))
        esper.create_entity(WorldState())

    def process(self, dt: float = 1 / 60):
        """Process all systems.

        Args:
            dt: Delta time in seconds
        """
        esper.process(dt)


def create_game_world() -> GameWorld:
    """Create and configure the ECS world with all systems.

    Returns:
        Configured GameWorld
    """
    return GameWorld()


def create_player(x: float = 5.0, y: float = 5.0) -> int:
    """Create the player entity.

    Args:
        x: Starting X position
        y: Starting Y position

    Returns:
        Player entity ID
    """
    return esper.create_entity(
        Position(x=x, y=y),
        Velocity(max_speed=3.0),
        Health(current=10, maximum=10, regen_rate=0.5),
        Stamina(current=100, maximum=100, regen_rate=10),
        Combat(attack_damage=2, dodge_chance=0.15),
        PlayerTag(),
        Renderable(color=8, size=1, sprite_id="player"),
    )


def create_enemy(
    x: float,
    y: float,
    name: str = "Goblin",
    is_boss: bool = False
) -> int:
    """Create an enemy entity.

    Args:
        x: X position
        y: Y position
        name: Enemy name
        is_boss: Whether this is a boss enemy

    Returns:
        Enemy entity ID
    """
    health = 20 if is_boss else random.randint(3, 8)
    damage = 5 if is_boss else random.randint(1, 3)

    return esper.create_entity(
        Position(x=x, y=y),
        Velocity(max_speed=1.5 if not is_boss else 1.0),
        Health(current=health, maximum=health),
        Combat(attack_damage=damage),
        EnemyTag(
            name=name,
            is_boss=is_boss,
            detection_range=8.0 if is_boss else 5.0,
            attack_range=2.0 if is_boss else 1.5,
        ),
        Renderable(
            color=8 if is_boss else 9,
            size=2 if is_boss else 1,
            sprite_id="boss" if is_boss else "enemy"
        ),
    )
