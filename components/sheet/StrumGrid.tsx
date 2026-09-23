import type { Slot } from '@/lib/types';

const LABELS = ['1', 'e', '&', 'a', '2', 'e', '&', 'a', '3', 'e', '&', 'a', '4', 'e', '&', 'a'];

export function patternName(index: number): string {
  return `PATTERN ${String.fromCharCode(65 + index)}`;
}

export function StrumGrid({
  name, use, slots, size = 'desktop',
}: { name: string; use: string; slots: Slot[]; size?: 'desktop' | 'mobile' }) {
  const cell = size === 'desktop' ? 25 : 20;

  return (
    <div className="grow flex flex-col gap-[9px] bg-surface border border-line-soft rounded-[14px] p-[14px_16px]">
      <div className="flex items-baseline gap-[9px] min-w-0">
        <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-accent shrink-0">{name}</span>
        <span className="text-[11.5px] text-ink-4 truncate">{use}</span>
      </div>
      <div className="flex bg-bg border border-line-grid rounded-[10px] p-[10px_8px]">
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
              className={`flex flex-col items-center gap-[7px] ${divider ? 'border-l border-line-grid' : ''}`}
            >
              <span className={`font-mono text-[10px] ${isBeat ? 'text-ink-3 font-bold' : 'text-faint'}`}>
                {LABELS[i]}
              </span>
              <span
                className={`leading-none ${isRest ? 'text-[13px] text-rest' : 'text-[18px]'} ${
                  !isRest && s.accent ? 'text-accent font-bold' : !isRest ? 'text-lyric' : ''
                }`}
              >
                {glyph}
              </span>
              <span
                data-accent-bar={s.accent}
                className={`w-[14px] h-[2px] rounded-[1px] ${s.accent ? 'bg-accent' : 'bg-transparent'}`}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}
