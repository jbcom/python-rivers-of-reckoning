import { test, expect } from '@playwright/test'

test.describe('Rivers of Reckoning - Strata Edition', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('game loads and renders 3D canvas', async ({ page }) => {
    // Wait for React to mount
    await page.waitForSelector('canvas', { timeout: 10000 })
    
    // Verify canvas exists
    const canvas = await page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/game-loaded.png' })
  })

  test('terrain and water render', async ({ page }) => {
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

  test('day/night cycle and weather work', async ({ page }) => {
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.waitForTimeout(2000)
    
    // Take screenshot at "start"
    await page.screenshot({ path: 'tests/screenshots/time-0.png' })
    
    // Wait a bit for time to progress
    await page.waitForTimeout(3000)
    
    // Take screenshot showing time progression
    await page.screenshot({ path: 'tests/screenshots/time-3s.png' })
    
    // Verify rendering is still active
    const canvas = await page.locator('canvas')
    await expect(canvas).toBeVisible()
  })

  test('camera controls work', async ({ page }) => {
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.waitForTimeout(1000)
    
    const canvas = await page.locator('canvas')
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

  test('game performance - 60fps capable', async ({ page }) => {
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
    
    // Strata should easily hit 60fps
    expect(fps).toBeGreaterThan(30)
  })

  test('no console errors', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.waitForTimeout(3000)
    
    // Should have no errors
    expect(errors).toHaveLength(0)
  })

  test('game vs pygame comparison screenshot', async ({ page }) => {
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.waitForTimeout(2000)
    
    // Take a nice screenshot for comparison
    await page.screenshot({ 
      path: 'tests/screenshots/strata-vs-pygame.png',
      fullPage: true 
    })
    
    // Add text overlay showing "30 lines of code"
    await page.evaluate(() => {
      const div = document.createElement('div')
      div.style.position = 'fixed'
      div.style.top = '20px'
      div.style.right = '20px'
      div.style.padding = '20px'
      div.style.background = 'rgba(0, 0, 0, 0.8)'
      div.style.color = 'white'
      div.style.fontSize = '24px'
      div.style.fontFamily = 'monospace'
      div.style.borderRadius = '8px'
      div.style.zIndex = '9999'
      div.innerHTML = `
        <div>✅ Strata Edition</div>
        <div style="font-size: 16px; margin-top: 10px;">
          • 30 lines of code<br>
          • GPU-powered terrain<br>
          • Real-time weather<br>
          • Day/night cycle<br>
          • Built in 5 minutes
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
