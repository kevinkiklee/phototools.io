import { test, expect } from '@playwright/test'

function sidebar(page: import('@playwright/test').Page) {
  return page.locator('[class*="sidebar"]').first()
}

test.describe('ND Filter Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nd-filter-calculator')
  })

  test('changing base shutter speed updates result', async ({ page }) => {
    const panel = sidebar(page)

    // Get the initial result value
    const resultValue = panel.locator('[class*="resultValue"]').first()
    const initial = await resultValue.textContent()

    // Change the base shutter speed select (first select in the sidebar)
    const selects = panel.locator('select')
    await selects.first().selectOption({ index: 3 })

    // Result should change
    const updated = await resultValue.textContent()
    expect(updated).not.toBe(initial)
  })

  test('changing ND filter updates stops added', async ({ page }) => {
    const panel = sidebar(page)

    // The "Stops Added" result card is the second result card
    const stopsValue = panel.locator('[class*="resultValue"]').nth(1)
    const initial = await stopsValue.textContent()

    // Change the ND filter (second select in the sidebar)
    // Default is index 2 (ND8, 3 stops), so pick a different index
    const selects = panel.locator('select')
    await selects.nth(1).selectOption({ index: 5 })

    const updated = await stopsValue.textContent()
    expect(updated).not.toBe(initial)
  })

  test('quick reference table is visible', async ({ page }) => {
    const table = page.locator('table')
    await expect(table).toBeVisible()

    // Table should have multiple rows
    const rows = table.locator('tr')
    expect(await rows.count()).toBeGreaterThan(3)
  })

  test('result shows formatted shutter speed', async ({ page }) => {
    const panel = sidebar(page)
    const resultValue = panel.locator('[class*="resultValue"]').first()
    const text = await resultValue.textContent()
    // Shutter speed should be a non-empty string
    expect(text).toBeTruthy()
    expect(text!.length).toBeGreaterThan(0)
  })

  test('URL state persistence', async ({ page }) => {
    const panel = sidebar(page)
    const selects = panel.locator('select')

    // Change both selects
    await selects.first().selectOption({ index: 2 })
    await selects.nth(1).selectOption({ index: 3 })

    await page.waitForTimeout(300)

    // URL should have query params
    const url = page.url()
    expect(url).toContain('base=')
    expect(url).toContain('nd=')

    // Navigate to the same URL and verify state is restored
    const resultBefore = await panel.locator('[class*="resultValue"]').first().textContent()
    await page.goto(url)
    await page.waitForTimeout(300)
    const resultAfter = await sidebar(page).locator('[class*="resultValue"]').first().textContent()
    expect(resultAfter).toBe(resultBefore)
  })
})
