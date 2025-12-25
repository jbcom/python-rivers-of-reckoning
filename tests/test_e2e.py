import pytest
import subprocess
import time
import socket
import os
from playwright.sync_api import Page, expect

def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

@pytest.fixture(scope="module", autouse=True)
def web_server():
    # Ensure build/web exists
    if not os.path.exists("build/web"):
        subprocess.run(["python", "-m", "pygbag", "--build", "."], check=True)
    
    port = get_free_port()
    # Start a simple HTTP server in build/web
    process = subprocess.Popen(
        ["python", "-m", "http.server", str(port)],
        cwd="build/web",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for server to be ready
    url = f"http://localhost:{port}"
    timeout = 10
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection(("localhost", port), timeout=1):
                break
        except (socket.timeout, ConnectionRefusedError):
            time.sleep(0.5)
    else:
        process.terminate()
        raise RuntimeError("Failed to start web server")
        
    yield url
    
    process.terminate()
    process.wait()

def test_game_loads(page: Page, web_server: str):
    # Go to the local server
    page.goto(web_server)
    
    # Check title
    expect(page).to_have_title("Rivers of Reckoning")
    
    # Wait for the canvas to be present
    # pygbag's template usually has a canvas with id="canvas"
    canvas = page.locator("#canvas")
    expect(canvas).to_be_visible(timeout=30000)
    
    # Give it more time for WASM to initialize
    time.sleep(5)
    
    # Optional: Take a screenshot
    # page.screenshot(path="tests/e2e-screenshot.png")
    
    # Check if we can find some text that pygbag might render if it's not just a canvas
    # Actually, pygbag renders EVERYTHING to the canvas.
    # We can check if the canvas size is correct (960x960 logical, but might be scaled)
    box = canvas.bounding_box()
    assert box is not None
    assert box["width"] > 0
    assert box["height"] > 0

def test_game_keyboard_input(page: Page, web_server: str):
    page.goto(web_server)
    
    # Wait for canvas
    canvas = page.locator("#canvas")
    expect(canvas).to_be_visible(timeout=30000)
    
    # Wait for game to start
    time.sleep(5)
    
    # Press space to start (if on title screen)
    page.keyboard.press("Space")
    time.sleep(1)
    
    # Press ArrowRight to move
    page.keyboard.down("ArrowRight")
    time.sleep(0.5)
    page.keyboard.up("ArrowRight")
    
    # If it didn't crash, we're good
    assert page.is_closed() is False
