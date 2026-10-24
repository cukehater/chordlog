import type { ReactNode } from 'react';
import { MicroLabel } from './MicroLabel';

// 모바일은 1단 세로 배치, md부터 12컬럼 span. Tailwind가 읽을 수 있게 클래스를 리터럴로 둔다.
const SPAN: Record<number, string> = {
  1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4',
};

export function UnderlineField({
  label, htmlFor, span, children,
}: { label: string; htmlFor: string; span?: number; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-[7px] ${span ? SPAN[span] ?? '' : ''}`.trim()}>
      <MicroLabel as="label" htmlFor={htmlFor}>{label}</MicroLabel>
      {children}
    </div>
  );
}
