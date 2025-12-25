"""Pygame-ce Engine with responsive auto-scaling for web deployment.

Uses pygame.SCALED for automatic resolution scaling that works
seamlessly with pygbag for browser-based gameplay.
"""

import asyncio

import pygame

# Logical resolution (matches original Pygame RPG)
LOGICAL_WIDTH = 960
LOGICAL_HEIGHT = 960

# 16-color retro palette - Rivers of Reckoning Branded
PALETTE = {
    0: (12, 12, 20),  # Deep Void (Black)
    1: (20, 35, 52),  # Dark Water (Dark Blue)
    2: (82, 37, 70),  # Blood Marsh (Dark Purple)
    3: (15, 85, 60),  # Moss Green (Dark Green)
    4: (125, 70, 50),  # Mud Brown (Brown)
    5: (70, 80, 85),  # Wet Stone (Dark Gray)
    6: (140, 160, 175),  # Misty Air (Light Gray)
    7: (230, 245, 235),  # Froth White (White)
    8: (215, 40, 65),  # Reckoning Red (Red)
    9: (240, 130, 40),  # Embers (Orange)
    10: (220, 210, 60),  # Sulfur (Yellow)
    11: (60, 190, 110),  # Poison Ivy (Green)
    12: (50, 150, 210),  # River Blue (Blue)
    13: (90, 90, 140),  # Twilight (Indigo)
    14: (210, 100, 160),  # Lotus Pink (Pink)
    15: (240, 190, 150),  # Sand (Peach)
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
        self.screen = pygame.display.set_mode((LOGICAL_WIDTH, LOGICAL_HEIGHT), pygame.SCALED | pygame.RESIZABLE)
        pygame.display.set_caption(title)

        self.clock = pygame.time.Clock()
        self.running = True
        self.width = LOGICAL_WIDTH
        self.height = LOGICAL_HEIGHT

        # Font for text rendering (scaled for 960x960)
        self.font = pygame.font.Font(None, 32)

        # Input state for proper btnp (button pressed this frame)
        self._keys_pressed = set()
        self._keys_just_pressed = set()

        # Juice: Screen shake
        self.shake_amount = 0
        self.shake_timer = 0

    def shake(self, amount=4, duration=15):
        """Trigger screen shake juice.

        Args:
            amount: Pixel displacement
            duration: Number of frames
        """
        self.shake_amount = amount
        self.shake_timer = duration

    async def run(self, update, draw):
        """Run the async game loop (pygbag compatible).

        Args:
            update: Update callback function
            draw: Draw callback function
        """
        import random

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

            # Update juice
            if self.shake_timer > 0:
                self.shake_timer -= 1
                if self.shake_timer <= 0:
                    self.shake_amount = 0

            # Game update
            if update:
                update()

            # Game draw
            if draw:
                # Apply shake to the entire screen rendering if needed
                offset_x = 0
                offset_y = 0
                if self.shake_timer > 0:
                    offset_x = random.randint(-self.shake_amount, self.shake_amount)
                    offset_y = random.randint(-self.shake_amount, self.shake_amount)

                # Draw to a temporary surface then blit with offset for shake
                # For simplicity in this logical engine, we'll just draw everything
                # and let the individual draw calls handle the offset or ignore it.
                # Actually, better to just let the individual draw calls use self.get_draw_offset()
                self._draw_offset = (offset_x, offset_y)
                draw()

            pygame.display.flip()
            self.clock.tick(60)

            # Yield to browser event loop (required for pygbag)
            await asyncio.sleep(0)

        pygame.quit()

    def get_draw_offset(self):
        """Get current screen shake offset."""
        return getattr(self, "_draw_offset", (0, 0))

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
        ox, oy = self.get_draw_offset()
        c = PALETTE.get(col, (255, 255, 255))
        surface = self.font.render(str(s), True, c)
        self.screen.blit(surface, (x + ox, y + oy))

    def rect(self, x, y, w, h, col):
        """Draw filled rectangle.

        Args:
            x: X position
            y: Y position
            w: Width
            h: Height
            col: Color palette index
        """
        ox, oy = self.get_draw_offset()
        c = PALETTE.get(col, (0, 0, 0))
        pygame.draw.rect(self.screen, c, (x + ox, y + oy, w, h))

    def rectb(self, x, y, w, h, col):
        """Draw rectangle border.

        Args:
            x: X position
            y: Y position
            w: Width
            h: Height
            col: Color palette index
        """
        ox, oy = self.get_draw_offset()
        c = PALETTE.get(col, (255, 255, 255))
        pygame.draw.rect(self.screen, c, (x + ox, y + oy, w, h), 1)

    def circ(self, x, y, r, col):
        """Draw filled circle.

        Args:
            x: Center X
            y: Center Y
            r: Radius
            col: Color palette index
        """
        ox, oy = self.get_draw_offset()
        c = PALETTE.get(col, (255, 255, 255))
        pygame.draw.circle(self.screen, c, (x + ox, y + oy), r)

    def circb(self, x, y, r, col):
        """Draw circle border.

        Args:
            x: Center X
            y: Center Y
            r: Radius
            col: Color palette index
        """
        ox, oy = self.get_draw_offset()
        c = PALETTE.get(col, (255, 255, 255))
        pygame.draw.circle(self.screen, c, (x + ox, y + oy), r, 1)

    def line(self, x1, y1, x2, y2, col):
        """Draw line between two points.

        Args:
            x1, y1: Start point
            x2, y2: End point
            col: Color palette index
        """
        ox, oy = self.get_draw_offset()
        c = PALETTE.get(col, (255, 255, 255))
        pygame.draw.line(self.screen, c, (x1 + ox, y1 + oy), (x2 + ox, y2 + oy))

    def blit(self, surface, pos):
        """Blit a surface to the screen with shake offset.

        Args:
            surface: Pygame surface to draw
            pos: (x, y) coordinates
        """
        if surface is None:
            return
        ox, oy = self.get_draw_offset()
        self.screen.blit(surface, (pos[0] + ox, pos[1] + oy))

    def bar(self, x, y, w, h, val, max_val, col_fill, col_bg=0):
        """Draw a progress bar.

        Args:
            x, y: Position
            w, h: Dimensions
            val: Current value
            max_val: Maximum value
            col_fill: Fill color
            col_bg: Background color
        """
        self.rect(x, y, w, h, col_bg)
        if max_val > 0:
            fill_w = int((val / max_val) * w)
            if fill_w > 0:
                self.rect(x, y, fill_w, h, col_fill)
        self.rectb(x, y, w, h, 7)  # Always white border for bars
