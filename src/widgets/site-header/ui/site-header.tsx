import type { ReactNode } from 'react'

import { ThemeIcon } from '@/shared/ui/icons'
import { Wordmark } from '@/shared/ui/wordmark'

export const SiteHeader = ({
  variant,
  crumb,
  actions,
}: {
  variant: 'list' | 'detail' | 'editor' | 'bare'
  crumb?: string
  actions?: ReactNode
}) => {
  const bordered = variant !== 'bare'

  return (
    <header className={`hidden md:block shrink-0 ${bordered ? 'border-b border-line-header' : ''}`}>
      <div className="h-[60px] w-full max-w-[1360px] mx-auto box-border px-10 flex items-center gap-[20px]">
        <Wordmark />

        {variant === 'list' ? <span className="text-[13px] text-ink-5">개인 아카이브</span> : null}

        {crumb ? (
          <>
            <span className="text-faint">/</span>
            <span className="text-[13px] text-ink-4">{crumb}</span>
          </>
        ) : null}

        <div className="ml-auto flex items-center gap-[10px]">
          {actions}
          {variant !== 'bare' ? (
            <button
              aria-label="화면 테마 전환"
              className="w-9 h-9 flex items-center justify-center bg-bg border border-line rounded-md text-ink-4 cursor-pointer hover:bg-surface-2"
              type="button"
            >
              <ThemeIcon />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
