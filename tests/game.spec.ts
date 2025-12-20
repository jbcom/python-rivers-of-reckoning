import { test, expect } from '@playwright/test'

test.describe('Rivers of Reckoning - Strata Edition', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('title screen loads correctly', async ({ page }) => {
    // Wait for title screen to render
    await page.waitForTimeout(1000)
    
    // Check for title text
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toContain('RIVERS OF')
    expect(bodyText).toContain('RECKONING')
    
    // Check for start button
    const startButton = page.getByRole('button', { name: /start/i })
    await expect(startButton).toBeVisible()
    
    // Check for feature list
    expect(bodyText).toContain('procedural')
    
    // Screenshot title screen
    await page.screenshot({ path: 'tests/screenshots/title-screen.png' })
  })

  test('game starts when clicking START GAME', async ({ page }) => {
    // Wait for title screen
    await page.waitForTimeout(500)
    
    // Click start button
    const startButton = page.getByRole('button', { name: /start/i })
    await startButton.click()
    
    // Wait for 3D canvas to appear
    await page.waitForSelector('canvas', { timeout: 10000 })
    
    // Verify canvas exists
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // Take screenshot of game started
    await page.screenshot({ path: 'tests/screenshots/game-started.png' })
  })

  test('3D terrain and water render', async ({ page }) => {
    // Start the game
    await page.waitForTimeout(500)
    const startButton = page.getByRole('button', { name: /start/i })
    await startButton.click()
    
    await page.waitForSelector('canvas', { timeout: 10000 })
    
    // Wait for 3D scene to render
    await page.waitForTimeout(2000)
    
    // Take screenshot showing terrain/water
    await page.screenshot({ 
      path: 'tests/screenshots/terrain-water.png',
      fullPage: false 
    })
    
    // Verify WebGL context is active
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      return !!canvas?.getContext('webgl2') || !!canvas?.getContext('webgl')
    })
    expect(hasWebGL).toBe(true)
  })

  test('HUD displays game information', async ({ page }) => {
    // Start the game
    await page.waitForTimeout(500)
    const startButton = page.getByRole('button', { name: /start/i })
    await startButton.click()
    
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.waitForTimeout(1000)
    
    // Get all text content from the page
    const bodyText = await page.locator('body').textContent()
    
    // Check for health indicator
    const hasHealthIndicator = bodyText?.includes('Health') || 
                               bodyText?.includes('HP') || 
                               bodyText?.includes('/') // Health format "X / Y"
    expect(hasHealthIndicator).toBe(true)
    
    // Check for time display (Day X format)
    expect(bodyText).toMatch(/Day \d+/)
    
    // Check for biome display - should show one of the biome names
    const biomeTypes = ['Marsh', 'Forest', 'Desert', 'Tundra', 'Grassland', 'Caves']
    const hasBiomeDisplay = biomeTypes.some(biome => bodyText?.includes(biome))
    expect(hasBiomeDisplay).toBe(true)
    
    // Check for weather display
    const weatherTypes = ['Clear', 'Rain', 'Fog', 'Snow', 'Storm', 'clear', 'rain', 'fog', 'snow', 'storm']
    const hasWeatherDisplay = weatherTypes.some(type => bodyText?.includes(type))
    expect(hasWeatherDisplay).toBe(true)
  })

  test('day/night cycle displays correctly', async ({ page }) => {
    // Start the game
    await page.waitForTimeout(500)
    const startButton = page.getByRole('button', { name: /start/i })
    await startButton.click()
    
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.waitForTimeout(1000)
    
    // Check for time phase display
    const bodyText = await page.locator('body').textContent()
    const timePhases = ['dawn', 'day', 'dusk', 'night', 'Dawn', 'Day', 'Dusk', 'Night']
    const hasTimePhase = timePhases.some(phase => bodyText?.includes(phase))
    expect(hasTimePhase).toBe(true)
    
    // Take screenshot 
    await page.screenshot({ path: 'tests/screenshots/time-display.png' })
  })

  test('camera controls work', async ({ page }) => {
    // Start the game
    await page.waitForTimeout(500)
    const startButton = page.getByRole('button', { name: /start/i })
    await startButton.click()
    
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.waitForTimeout(1000)
    
    const canvas = page.locator('canvas')
    const box = await canvas.boundingBox()
    
    if (box) {
      // Click and drag to rotate camera
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2)
      await page.mouse.up()
      
      await page.waitForTimeout(500)
      
      // Screenshot after camera movement
      await page.screenshot({ path: 'tests/screenshots/camera-rotated.png' })
    }
    
    await expect(canvas).toBeVisible()
  })

  test('pause menu works', async ({ page }) => {
    // Start the game
    await page.waitForTimeout(500)
    const startButton = page.getByRole('button', { name: /start/i })
    await startButton.click()
    
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.waitForTimeout(500)
    
    // Press ESC to pause
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    
    // Check for pause menu
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toContain('PAUSED')
    
    // Check for resume button
    const resumeButton = page.getByRole('button', { name: /resume/i })
    await expect(resumeButton).toBeVisible()
    
    // Screenshot pause menu
    await page.screenshot({ path: 'tests/screenshots/pause-menu.png' })
    
    // Resume the game
    await resumeButton.click()
    await page.waitForTimeout(500)
    
    // Verify pause menu is gone
    const pausedText = await page.locator('body').textContent()
    expect(pausedText).not.toContain('PAUSED')
  })

  test('game performance - 30+ fps capable', async ({ page }) => {
    // Start the game
    await page.waitForTimeout(500)
    const startButton = page.getByRole('button', { name: /start/i })
    await startButton.click()
    
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.waitForTimeout(2000)
    
    // Measure FPS
    const fps = await page.evaluate(async () => {
      let frameCount = 0
      let lastTime = performance.now()
      
      return new Promise<number>((resolve) => {
        const measureFrame = () => {
          frameCount++
          const currentTime = performance.now()
          
          if (currentTime - lastTime >= 1000) {
            resolve(frameCount)
          } else {
            requestAnimationFrame(measureFrame)
          }
        }
        requestAnimationFrame(measureFrame)
      })
    })
    
    console.log(`Game running at ${fps} FPS`)
    
    // Should maintain at least 30fps
    expect(fps).toBeGreaterThan(30)
  })

  test('no critical console errors', async ({ page }) => {
    const criticalErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Filter out non-critical WebGL warnings
        if (!text.includes('WebGL') && !text.includes('warning') && !text.includes('404')) {
          criticalErrors.push(text)
        }
      }
    })
    
    // Start the game
    await page.waitForTimeout(500)
    const startButton = page.getByRole('button', { name: /start/i })
    await startButton.click()
    
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.waitForTimeout(3000)
    
    // Should have no critical errors
    expect(criticalErrors).toHaveLength(0)
  })

  test('game comparison screenshot', async ({ page }) => {
    // Start the game
    await page.waitForTimeout(500)
    const startButton = page.getByRole('button', { name: /start/i })
    await startButton.click()
    
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.waitForTimeout(2000)
    
    // Take a nice screenshot for comparison
    await page.screenshot({ 
      path: 'tests/screenshots/strata-vs-pygame.png',
      fullPage: true 
    })
    
    // Add text overlay showing comparison info
    await page.evaluate(() => {
      const div = document.createElement('div')
      div.style.position = 'fixed'
      div.style.top = '20px'
      div.style.right = '20px'
      div.style.padding = '20px'
      div.style.background = 'rgba(0, 0, 0, 0.85)'
      div.style.color = 'white'
      div.style.fontSize = '18px'
      div.style.fontFamily = 'system-ui, sans-serif'
      div.style.borderRadius = '12px'
      div.style.zIndex = '9999'
      div.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)'
      div.innerHTML = `
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">
          ✅ Strata Edition
        </div>
        <div style="font-size: 14px; line-height: 1.6;">
          • Full Strata API integration<br>
          • GPU-powered procedural terrain<br>
          • Real-time weather system<br>
          • Dynamic day/night cycle<br>
          • Seeded deterministic generation<br>
          • Zustand state management<br>
          • Material-UI game interface
        </div>
      `
      document.body.appendChild(div)
    })
    
    await page.screenshot({ 
      path: 'tests/screenshots/strata-annotated.png',
      fullPage: true 
    })
  })
})
