import type { ReactNode } from 'react';

const MICRO = 'text-[12px] font-medium tracking-[0.04em] uppercase';

export function MicroLabel({
  children, as = 'span', htmlFor, className = '',
}: { children: ReactNode; as?: 'span' | 'label'; htmlFor?: string; className?: string }) {
  // 폼 라벨은 읽어야 하는 텍스트라 text-dim(2.9:1) 대신 4.5:1을 넘는 text-ink-4
  const cls = `${MICRO} ${as === 'label' ? 'text-ink-4' : 'text-dim'} ${className}`.trim();
  if (as === 'label') return <label htmlFor={htmlFor} className={cls}>{children}</label>;
  return <span className={cls}>{children}</span>;
}
