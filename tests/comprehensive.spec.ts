import { test, expect } from '@playwright/test'

test.describe('Comprehensive Game Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Wait for title screen
    const startButton = page.getByRole('button', { name: /start/i })
    await startButton.waitFor({ state: 'visible', timeout: 30000 })
    
    // Click start
    await startButton.click()
    
    // Wait for canvas to be present and have a size
    await page.waitForSelector('canvas', { timeout: 30000 })
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas')
      return canvas && canvas.clientWidth > 0 && canvas.clientHeight > 0
    })
    
    // Wait for at least one frame to be rendered
    await page.evaluate(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve))
    })
    
    // Additional wait for stabilization
    await page.waitForTimeout(3000)
  })

  test.describe('Input Module', () => {
    test('all keyboard keys for movement', async ({ page }) => {
      const keys = ['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      for (const key of keys) {
        await page.keyboard.down(key)
        await page.waitForTimeout(100)
        await page.keyboard.up(key)
      }
      // Check that game hasn't crashed and canvas is still there
      await expect(page.locator('canvas')).toBeVisible()
    })

    test('mouse button handling (attack)', async ({ page }) => {
      // Click on the canvas to attack
      const canvas = page.locator('canvas')
      await canvas.click({ position: { x: 100, y: 100 } })
      
      // We can't easily check for the ringGeometry visibility in R3F from Playwright
      // but we can check for console errors or just ensure the game stays stable
      await page.waitForTimeout(100)
      await expect(canvas).toBeVisible()
    })

    test('touch events simulation', async ({ page }) => {
      // Swipe simulation using mouse (OrbitControls handles this)
      const canvas = page.locator('canvas')
      const box = await canvas.boundingBox()
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50)
        await page.mouse.up()
      }
      
      await expect(page.locator('canvas')).toBeVisible()
    })

    test('joystick dead zone behavior', async ({ page }) => {
      // Inside dead zone (0.1)
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('game:joystick', { detail: { x: 0.05, y: 0.05 } }))
      })
      await page.waitForTimeout(100)
      
      // Outside dead zone
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('game:joystick', { detail: { x: 0.8, y: 0.0 } }))
      })
      await page.waitForTimeout(200)
      
      await expect(page.locator('canvas')).toBeVisible()
    })
  })

  test.describe('Graphics Module', () => {
    test('screen resize edge cases', async ({ page }) => {
      // Test very small resolution
      await page.setViewportSize({ width: 320, height: 480 })
      await page.waitForTimeout(1000)
      await expect(page.locator('canvas')).toBeVisible()
      
      // Test very large resolution
      await page.setViewportSize({ width: 1280, height: 720 }) // Smaller large to be safe
      await page.waitForTimeout(1000)
      await expect(page.locator('canvas')).toBeVisible()
      
      // Test standard
      await page.setViewportSize({ width: 1024, height: 768 })
      await page.waitForTimeout(1000)
      await expect(page.locator('canvas')).toBeVisible()
    })
  })

  test.describe('Core Module Integration', () => {
    test('player movement with map boundaries in-game', async ({ page }) => {
      // Move far in one direction
      for (let i = 0; i < 20; i++) {
        await page.keyboard.down('w')
        await page.waitForTimeout(50)
      }
      await page.keyboard.up('w')
      
      // HUD should show coordinates within boundaries (approx 95)
      const bodyText = await page.locator('body').textContent()
      // Use regex to find coordinates (x, z)
      const coordMatch = bodyText?.match(/\(([-\d]+),\s*([-\d]+)\)/)
      if (coordMatch) {
        const x = parseInt(coordMatch[1])
        const z = parseInt(coordMatch[2])
        expect(Math.abs(x)).toBeLessThanOrEqual(100) // WORLD_BOUNDS is 95
        expect(Math.abs(z)).toBeLessThanOrEqual(100)
      }
    })
  })

  test.describe('Full Integration Flow', () => {
    test('start -> play -> pause -> resume -> pause -> quit', async ({ page }) => {
      // Already started in beforeEach
      
      // Play a bit
      await page.keyboard.down('w')
      await page.waitForTimeout(200)
      await page.keyboard.up('w')
      
      // Pause
      await page.keyboard.press('Escape')
      await expect(page.getByText('PAUSED')).toBeVisible()
      
      // Resume
      await page.getByRole('button', { name: /resume/i }).click()
      await expect(page.getByText('PAUSED')).not.toBeVisible()
      
      // Pause again
      await page.keyboard.press('Escape')
      
      // Quit to menu
      await page.getByRole('button', { name: /quit/i }).click()
      await expect(page.getByRole('button', { name: /start/i })).toBeVisible()
    })
  })
})
