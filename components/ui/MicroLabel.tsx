import type { ReactNode } from 'react';

const MICRO = 'font-mono text-[10px] tracking-[0.16em] uppercase text-dim';

export function MicroLabel({
  children, as = 'span', htmlFor, className = '',
}: { children: ReactNode; as?: 'span' | 'label'; htmlFor?: string; className?: string }) {
  const cls = `${MICRO} ${className}`.trim();
  if (as === 'label') return <label htmlFor={htmlFor} className={cls}>{children}</label>;
  return <span className={cls}>{children}</span>;
}
