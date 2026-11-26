import { expect, test } from '@playwright/test'

test('랜딩에 서비스 제목이 보인다', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Chordlog' })).toBeVisible()
})
