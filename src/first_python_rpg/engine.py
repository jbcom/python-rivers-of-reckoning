import pygame
import asyncio
import sys

class Engine:
    def __init__(self, width=960, height=960, title="First Python RPG"):
        pygame.init()
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption(title)
        self.clock = pygame.time.Clock()
        self.running = True
        self.update_func = None
        self.draw_func = None
        self.width = width
        self.height = height

    def run(self, update, draw):
        self.update_func = update
        self.draw_func = draw

        async def main_loop():
            while self.running:
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        self.running = False

                if self.update_func:
                    self.update_func()

                if self.draw_func:
                    self.draw_func()

                pygame.display.flip()
                self.clock.tick(60)
                await asyncio.sleep(0)

            pygame.quit()
            sys.exit()

        return main_loop()

    # Pyxel-like compatibility layer (optional, or we refactor callers)
    def btnp(self, key):
        # Very basic key check, not exactly btnp (pressed this frame)
        # For true btnp we need to track state.
        # But standard get_pressed is often enough or event loop.
        # Let's use event loop in update if possible, but Game expects checking state.
        # We'll rely on pygame.key.get_pressed() for now as 'btn' and maybe implement 'btnp' later.
        # Mapping Pyxel keys to Pygame keys
        keys = pygame.key.get_pressed()
        if key == "up": return keys[pygame.K_UP]
        if key == "down": return keys[pygame.K_DOWN]
        if key == "left": return keys[pygame.K_LEFT]
        if key == "right": return keys[pygame.K_RIGHT]
        if key == "space": return keys[pygame.K_SPACE]
        if key == "enter": return keys[pygame.K_RETURN]
        if key == "escape": return keys[pygame.K_ESCAPE]
        if key == "q": return keys[pygame.K_q]
        if key == "w": return keys[pygame.K_w]
        return False

    def cls(self, color):
        # Color mapping (16 colors)
        colors = {
            0: (0, 0, 0),       # Black
            1: (29, 43, 83),    # Dark Blue
            2: (126, 37, 83),   # Dark Purple
            3: (0, 135, 81),    # Dark Green
            4: (171, 82, 54),   # Brown
            5: (95, 87, 79),    # Dark Gray
            6: (194, 195, 199), # Light Gray
            7: (255, 241, 232), # White
            8: (255, 0, 77),    # Red
            9: (255, 163, 0),   # Orange
            10: (255, 236, 39), # Yellow
            11: (0, 228, 54),   # Green
            12: (41, 173, 255), # Blue
            13: (131, 118, 156),# Indigo
            14: (255, 119, 168),# Pink
            15: (255, 204, 170),# Peach
        }
        c = colors.get(color, (0,0,0))
        self.screen.fill(c)

    def text(self, x, y, s, col):
        font = pygame.font.Font(None, 24)
        colors = {
            0: (0, 0, 0), 7: (255, 255, 255), 8: (255, 0, 0),
            10: (255, 255, 0), 11: (0, 255, 0), 6: (200, 200, 200),
            3: (0, 128, 0), 12: (0, 0, 255), 5: (128, 128, 128)
        }
        c = colors.get(col, (255, 255, 255))
        surface = font.render(s, True, c)
        # Scale position if we are 960x960 but logic thinks 256x256?
        # If logic thinks 256, we should scale everything up or change logic.
        # User said 960x960 Pygame version.
        # We will scale coordinates by 3.75? Or just 4x.
        scale = 3.75
        self.screen.blit(surface, (x * scale, y * scale))

    def rect(self, x, y, w, h, col):
        colors = {
            0: (0, 0, 0), 1: (29, 43, 83), 2: (126, 37, 83), 3: (0, 135, 81),
            4: (171, 82, 54), 5: (95, 87, 79), 6: (194, 195, 199), 7: (255, 241, 232),
            8: (255, 0, 77), 9: (255, 163, 0), 10: (255, 236, 39), 11: (0, 228, 54),
            12: (41, 173, 255), 13: (131, 118, 156), 14: (255, 119, 168), 15: (255, 204, 170)
        }
        c = colors.get(col, (0,0,0))
        scale = 3.75
        pygame.draw.rect(self.screen, c, (x * scale, y * scale, w * scale, h * scale))

    def rectb(self, x, y, w, h, col):
        colors = {
            0: (0, 0, 0), 7: (255, 255, 255), 6: (200, 200, 200),
            8: (255, 0, 0), 3: (0, 255, 0)
        }
        c = colors.get(col, (255, 255, 255))
        scale = 3.75
        pygame.draw.rect(self.screen, c, (x * scale, y * scale, w * scale, h * scale), 1)
