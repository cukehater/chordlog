import type { ReactNode } from 'react';
import { Wordmark } from './Wordmark';
import { ThemeIcon } from '@/components/icons';

export function SiteHeader({
  variant, crumb, actions,
}: { variant: 'list' | 'detail' | 'editor' | 'bare'; crumb?: string; actions?: ReactNode }) {
  const bordered = variant !== 'bare';

  return (
    <header
      className={`hidden md:flex shrink-0 h-[60px] px-[48px] items-center gap-[20px] ${
        bordered ? 'border-b border-line-header' : ''
      }`}
    >
      <Wordmark />

      {variant === 'list' ? (
        <span className="font-mono text-[11px] tracking-[0.12em] text-dim">PERSONAL ARCHIVE</span>
      ) : null}

      {crumb ? (
        <>
          <span className="text-hairline">/</span>
          <span className="text-[13px] text-ink-4">{crumb}</span>
        </>
      ) : null}

      <div className="ml-auto flex items-center gap-[10px]">
        {actions}
        {variant !== 'bare' ? (
          <button
            type="button"
            aria-label="화면 테마 전환"
            className="w-[36px] h-[36px] flex items-center justify-center bg-surface-2 border border-line rounded-md text-ink-3 cursor-pointer"
          >
            <ThemeIcon />
          </button>
        ) : null}
      </div>
    </header>
  );
}
