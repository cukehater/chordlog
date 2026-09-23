import type { ReactNode } from 'react';
import { MicroLabel } from './MicroLabel';

export function UnderlineField({
  label, htmlFor, span, children,
}: { label: string; htmlFor: string; span?: number; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[7px]" style={span ? { gridColumn: `span ${span}` } : undefined}>
      <MicroLabel as="label" htmlFor={htmlFor}>{label}</MicroLabel>
      {children}
    </div>
  );
}
