import type { ReactNode } from 'react'

export const Badge = ({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'accent' | 'neutral'
}) => {
  const toneCls =
    tone === 'accent' ? 'text-accent-mute border-accent/35' : 'text-ink-4 border-line-strong'
  return (
    <span
      className={`font-mono text-[9px] font-bold tracking-[0.08em] border rounded-xs px-[5px] py-px ${toneCls}`}
    >
      {children}
    </span>
  )
}
