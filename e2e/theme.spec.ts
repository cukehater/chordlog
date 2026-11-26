import { expect, type Page, test } from '@playwright/test'

const bodyColors = (page: Page) =>
  page.evaluate(() => {
    const style = getComputedStyle(document.body)
    return { bg: style.backgroundColor, fg: style.color }
  })

test.describe('다크 테마(OS 설정)', () => {
  test.use({ colorScheme: 'dark' })

  test('곡 목록이 로즈우드 배경과 크림 글자로 보인다', async ({ page }) => {
    await page.goto('/songs')
    expect(await bodyColors(page)).toEqual({ bg: 'rgb(18, 13, 10)', fg: 'rgb(244, 236, 221)' })
  })
})

test.describe('라이트 테마(OS 설정)', () => {
  test.use({ colorScheme: 'light' })

  for (const path of ['/', '/songs']) {
    test(`${path}가 종이색 배경과 짙은 글자로 보인다`, async ({ page }) => {
      await page.goto(path)
      expect(await bodyColors(page)).toEqual({ bg: 'rgb(242, 236, 227)', fg: 'rgb(31, 23, 18)' })
    })
  }

  test('<html data-theme="dark">가 OS 설정보다 우선한다', async ({ page }) => {
    await page.goto('/songs')
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark'
    })
    expect((await bodyColors(page)).bg).toBe('rgb(18, 13, 10)')
  })

  test('375×812에서 가로 스크롤 없이 타이틀과 CTA가 보인다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'Chordlog' })).toBeInViewport()
    await expect(page.getByRole('link', { name: /코드 둘러보기/ })).toBeInViewport()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBe(0)
  })

  test('헤더 버튼으로 전환하고 새로고침해도 유지된다', async ({ page }) => {
    await page.goto('/songs')
    await page.getByRole('button', { name: '화면 테마 전환' }).click()
    expect((await bodyColors(page)).bg).toBe('rgb(18, 13, 10)')
    await page.reload()
    expect((await bodyColors(page)).bg).toBe('rgb(18, 13, 10)')
    await page.getByRole('button', { name: '화면 테마 전환' }).click()
    expect((await bodyColors(page)).bg).toBe('rgb(242, 236, 227)')
  })
})
