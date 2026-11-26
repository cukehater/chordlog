'use client'

import { toggleColorTheme } from '@/shared/lib/color-theme'
import { ThemeIcon } from '@/shared/ui/icons'

export const ThemeToggle = () => {
  return (
    <button
      aria-label="화면 테마 전환"
      className="w-9 h-9 flex items-center justify-center bg-bg border border-line rounded-md text-ink-4 cursor-pointer hover:bg-surface-2"
      type="button"
      onClick={toggleColorTheme}
    >
      <ThemeIcon />
    </button>
  )
}
