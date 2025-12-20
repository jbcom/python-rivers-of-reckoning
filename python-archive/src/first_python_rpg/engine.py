"""Pygame-ce Engine with responsive auto-scaling for web deployment.

Uses pygame.SCALED for automatic resolution scaling that works
seamlessly with pygbag for browser-based gameplay.
"""

import pygame
import asyncio


# Logical resolution (game thinks in these coordinates)
LOGICAL_WIDTH = 256
LOGICAL_HEIGHT = 256

# 16-color retro palette
PALETTE = {
    0: (0, 0, 0),        # Black
    1: (29, 43, 83),     # Dark Blue
    2: (126, 37, 83),    # Dark Purple
    3: (0, 135, 81),     # Dark Green
    4: (171, 82, 54),    # Brown
    5: (95, 87, 79),     # Dark Gray
    6: (194, 195, 199),  # Light Gray
    7: (255, 241, 232),  # White
    8: (255, 0, 77),     # Red
    9: (255, 163, 0),    # Orange
    10: (255, 236, 39),  # Yellow
    11: (0, 228, 54),    # Green
    12: (41, 173, 255),  # Blue
    13: (131, 118, 156),  # Indigo
    14: (255, 119, 168),  # Pink
    15: (255, 204, 170),  # Peach
}


class Engine:
    """Responsive pygame engine with auto-scaling for web deployment.

    Uses pygame.SCALED flag for automatic resolution scaling that
    maintains aspect ratio and works with pygbag for browser games.
    """

    def __init__(self, title="Rivers of Reckoning"):
        """Initialize the responsive engine.

        Args:
            title: Window title
        """
        pygame.init()

        # Use SCALED for automatic scaling + RESIZABLE for window flexibility
        # This automatically handles high-DPI displays and browser resizing
        self.screen = pygame.display.set_mode(
            (LOGICAL_WIDTH, LOGICAL_HEIGHT),
            pygame.SCALED | pygame.RESIZABLE
        )
        pygame.display.set_caption(title)

        self.clock = pygame.time.Clock()
        self.running = True
        self.width = LOGICAL_WIDTH
        self.height = LOGICAL_HEIGHT

        # Font for text rendering (scaled appropriately)
        self.font = pygame.font.Font(None, 8)  # Small font for 256x256 logical

        # Input state for proper btnp (button pressed this frame)
        self._keys_pressed = set()
        self._keys_just_pressed = set()

    async def run(self, update, draw):
        """Run the async game loop (pygbag compatible).

        Args:
            update: Update callback function
            draw: Draw callback function
        """
        while self.running:
            # Handle events
            self._keys_just_pressed.clear()

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                elif event.type == pygame.KEYDOWN:
                    self._keys_just_pressed.add(event.key)
                    self._keys_pressed.add(event.key)
                elif event.type == pygame.KEYUP:
                    self._keys_pressed.discard(event.key)
                elif event.type == pygame.VIDEORESIZE:
                    # pygame.SCALED handles this automatically
                    pass

            # Game update
            if update:
                update()

            # Game draw
            if draw:
                draw()

            pygame.display.flip()
            self.clock.tick(60)

            # Yield to browser event loop (required for pygbag)
            await asyncio.sleep(0)

        pygame.quit()

    def btnp(self, key):
        """Check if a button was just pressed this frame.

        Args:
            key: Key name string

        Returns:
            True if key was just pressed
        """
        key_map = {
            "up": pygame.K_UP,
            "down": pygame.K_DOWN,
            "left": pygame.K_LEFT,
            "right": pygame.K_RIGHT,
            "space": pygame.K_SPACE,
            "enter": pygame.K_RETURN,
            "escape": pygame.K_ESCAPE,
            "q": pygame.K_q,
            "w": pygame.K_w,
            "a": pygame.K_a,
            "s": pygame.K_s,
        }
        pygame_key = key_map.get(key)
        if pygame_key:
            return pygame_key in self._keys_just_pressed
        return False

    def btn(self, key):
        """Check if a button is currently held down.

        Args:
            key: Key name string

        Returns:
            True if key is held
        """
        key_map = {
            "up": pygame.K_UP,
            "down": pygame.K_DOWN,
            "left": pygame.K_LEFT,
            "right": pygame.K_RIGHT,
            "space": pygame.K_SPACE,
            "enter": pygame.K_RETURN,
            "escape": pygame.K_ESCAPE,
            "q": pygame.K_q,
            "w": pygame.K_w,
            "a": pygame.K_a,
            "s": pygame.K_s,
        }
        pygame_key = key_map.get(key)
        if pygame_key:
            return pygame_key in self._keys_pressed
        return False

    def cls(self, color):
        """Clear screen with color.

        Args:
            color: Palette index (0-15)
        """
        c = PALETTE.get(color, (0, 0, 0))
        self.screen.fill(c)

    def text(self, x, y, s, col):
        """Draw text at position.

        Args:
            x: X position in logical coordinates
            y: Y position in logical coordinates
            s: String to draw
            col: Color palette index
        """
        c = PALETTE.get(col, (255, 255, 255))
        surface = self.font.render(str(s), True, c)
        self.screen.blit(surface, (x, y))

    def rect(self, x, y, w, h, col):
        """Draw filled rectangle.

        Args:
            x: X position
            y: Y position
            w: Width
            h: Height
            col: Color palette index
        """
        c = PALETTE.get(col, (0, 0, 0))
        pygame.draw.rect(self.screen, c, (x, y, w, h))

    def rectb(self, x, y, w, h, col):
        """Draw rectangle border.

        Args:
            x: X position
            y: Y position
            w: Width
            h: Height
            col: Color palette index
        """
        c = PALETTE.get(col, (255, 255, 255))
        pygame.draw.rect(self.screen, c, (x, y, w, h), 1)

    def circ(self, x, y, r, col):
        """Draw filled circle.

        Args:
            x: Center X
            y: Center Y
            r: Radius
            col: Color palette index
        """
        c = PALETTE.get(col, (255, 255, 255))
        pygame.draw.circle(self.screen, c, (x, y), r)

    def circb(self, x, y, r, col):
        """Draw circle border.

        Args:
            x: Center X
            y: Center Y
            r: Radius
            col: Color palette index
        """
        c = PALETTE.get(col, (255, 255, 255))
        pygame.draw.circle(self.screen, c, (x, y), r, 1)

    def line(self, x1, y1, x2, y2, col):
        """Draw line between two points.

        Args:
            x1, y1: Start point
            x2, y2: End point
            col: Color palette index
        """
        c = PALETTE.get(col, (255, 255, 255))
        pygame.draw.line(self.screen, c, (x1, y1), (x2, y2))
