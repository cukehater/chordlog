import { describe, expect, it } from 'vitest'

import { resolveColorTheme } from './color-theme'

describe('resolveColorTheme', () => {
  it('data-theme이 없으면 OS 설정을 따른다', () => {
    expect(resolveColorTheme(undefined, true)).toBe('light')
    expect(resolveColorTheme(undefined, false)).toBe('dark')
  })

  it('data-theme이 OS 설정보다 우선한다', () => {
    expect(resolveColorTheme('dark', true)).toBe('dark')
    expect(resolveColorTheme('light', false)).toBe('light')
  })

  it('알 수 없는 data-theme 값은 무시한다', () => {
    expect(resolveColorTheme('sepia', true)).toBe('light')
  })
})
