import type { ReactNode } from 'react';
import type { Slot } from '@/lib/types';

const LABELS = ['1', 'e', '&', 'a', '2', 'e', '&', 'a', '3', 'e', '&', 'a', '4', 'e', '&', 'a'];

export function patternName(index: number): string {
  return `패턴 ${String.fromCharCode(65 + index)}`;
}

export function StrumGrid({
  name, use, slots, size = 'desktop', action,
}: { name: string; use: string; slots: Slot[]; size?: 'desktop' | 'mobile'; action?: ReactNode }) {
  const cell = size === 'desktop' ? 16 : 20;

  return (
    <section className="border border-line rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h2 className="m-0 grow min-w-0 flex items-baseline justify-between gap-3 text-[14px] font-bold text-ink">
          <span className="shrink-0">{name}</span>
          <span className="min-w-0 text-[12px] font-normal text-ink-5 truncate" title={use}>{use}</span>
        </h2>
        {action}
      </div>
      <div className="flex">
        {slots.map((s, i) => {
          const isBeat = i % 4 === 0;
          const divider = isBeat && i > 0;
          const glyph = s.stroke === 'D' ? '↓' : s.stroke === 'U' ? '↑' : '·';
          const isRest = s.stroke === null;
          return (
            <span
              key={i}
              data-slot
              data-beat-divider={divider}
              style={{ width: cell }}
              className={`flex flex-col items-center gap-[6px] ${divider ? 'border-l border-line' : ''}`}
            >
              <span
                className={`leading-none ${isRest ? 'text-[12px] text-ink-5' : 'text-[16px]'} ${
                  !isRest && s.accent ? 'text-accent font-bold' : !isRest ? 'text-ink-2' : ''
                }`}
              >
                {glyph}
              </span>
              <span
                data-accent-bar={s.accent}
                className={`w-[10px] h-[2px] rounded-[1px] ${s.accent ? 'bg-accent' : 'bg-transparent'}`}
              />
              <span className={`text-[11px] tabular-nums ${isBeat ? 'text-ink-2 font-bold' : 'text-ink-5'}`}>
                {LABELS[i]}
              </span>
            </span>
          );
        })}
      </div>
      <p className="m-0 text-[11.5px] text-ink-5">↓ 다운 · ↑ 업 · 파란색은 강세</p>
    </section>
  );
}
