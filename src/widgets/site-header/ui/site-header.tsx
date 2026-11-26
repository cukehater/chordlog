import type { ReactNode } from 'react'

import { Wordmark } from '@/shared/ui/wordmark'

import { ThemeToggle } from './theme-toggle'

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
      <div className="h-[60px] page-grid flex items-center gap-[20px]">
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
          {variant !== 'bare' ? <ThemeToggle /> : null}
        </div>
      </div>
    </header>
  )
}
