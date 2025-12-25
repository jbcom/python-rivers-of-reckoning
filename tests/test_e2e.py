"""
End-to-End tests for Rivers of Reckoning web build.

Best practices followed:
- Tests are isolated and independent
- Uses proper Playwright fixtures
- Tests user-visible behavior (canvas, keyboard input)
- Avoids testing implementation details
- Uses explicit waits with timeouts
"""

import pytest
from playwright.sync_api import Page, expect


@pytest.fixture(scope="session")
def base_url():
    """
    Base URL for the web server.
    In CI, this should point to the built pygbag output served via HTTP.
    Locally, you can run: python -m http.server 8000 -d build/web
    """
    import os

    return os.getenv("BASE_URL", "http://localhost:8000")


def test_game_loads(page: Page, base_url: str):
    """Test that the game loads and renders the canvas."""
    # Navigate to the game
    page.goto(base_url, wait_until="domcontentloaded")

    # Verify page title
    expect(page).to_have_title("Rivers of Reckoning", timeout=10000)

    # Wait for canvas to be present (pygbag renders to canvas#canvas)
    canvas = page.locator("#canvas")
    expect(canvas).to_be_visible(timeout=30000)

    # Verify canvas has valid dimensions
    box = canvas.bounding_box()
    assert box is not None, "Canvas bounding box should exist"
    assert box["width"] > 0, "Canvas width should be positive"
    assert box["height"] > 0, "Canvas height should be positive"

    # Optional: Wait for WASM to fully initialize
    # pygbag shows loading text before the game starts
    page.wait_for_timeout(3000)


def test_game_keyboard_input(page: Page, base_url: str):
    """Test that the game responds to keyboard input without crashing."""
    # Navigate to the game
    page.goto(base_url, wait_until="domcontentloaded")

    # Wait for canvas
    canvas = page.locator("#canvas")
    expect(canvas).to_be_visible(timeout=30000)

    # Focus the canvas (required for keyboard events)
    canvas.click()

    # Wait for WASM to initialize
    page.wait_for_timeout(3000)

    # Simulate keyboard input (space to start, arrow to move)
    page.keyboard.press("Space")
    page.wait_for_timeout(500)

    page.keyboard.press("ArrowRight")
    page.wait_for_timeout(500)

    page.keyboard.press("ArrowDown")
    page.wait_for_timeout(500)

    # Verify page is still responsive (not crashed)
    assert page.is_closed() is False, "Page should not be closed"
    expect(canvas).to_be_visible()


def test_game_canvas_rendering(page: Page, base_url: str):
    """Test that the canvas is actively rendering (not frozen)."""
    page.goto(base_url, wait_until="domcontentloaded")

    canvas = page.locator("#canvas")
    expect(canvas).to_be_visible(timeout=30000)

    # Take initial screenshot
    page.wait_for_timeout(3000)
    screenshot1 = canvas.screenshot()

    # Interact with game
    canvas.click()
    page.keyboard.press("ArrowRight")
    page.wait_for_timeout(1000)

    # Take second screenshot
    screenshot2 = canvas.screenshot()

    # Screenshots should be different (game is rendering/updating)
    # This is a basic smoke test - if frozen, screenshots would be identical
    assert screenshot1 != screenshot2, "Canvas should be actively rendering"
