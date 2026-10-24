'use client';

export const SNIPPETS = {
  chord: '[]',
  section: '{soc: 구간 이름}\n\n{eoc}\n',
  strum: '{sos: 쓰는 구간}\nD - D - D U D - D - D - D U - -\n>               >\n{eos}\n',
  tab: '{sot: 제목  x1}\nE|---------------------------|\nB|---------------------------|\nG|---------------------------|\nD|---------------------------|\nA|---------------------------|\nE|---------------------------|\n{eot}\n',
  comment: '{comment: }\n',
} as const;

const BUTTONS: { key: keyof typeof SNIPPETS; label: string; accent?: boolean }[] = [
  { key: 'chord', label: '[코드]' },
  { key: 'section', label: '섹션' },
  { key: 'strum', label: '스트러밍', accent: true },
  { key: 'tab', label: 'TAB 6줄', accent: true },
  { key: 'comment', label: '메모' },
];

export function InsertToolbar({ onInsert }: { onInsert: (snippet: string) => void }) {
  return (
    <div className="shrink-0 flex items-center gap-[7px] p-[9px_20px] border-b border-line-hair overflow-x-auto">
      <span className="font-mono text-[9.5px] tracking-[0.14em] text-dim mr-[3px]">INSERT</span>
      {BUTTONS.map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={() => onInsert(SNIPPETS[b.key])}
          className={`shrink-0 h-[44px] md:h-[28px] px-[10px] border rounded-sm font-mono text-[11.5px] cursor-pointer ${
            b.accent ? 'border-accent/40 bg-accent/10 text-accent' : 'border-line bg-transparent text-ink-2'
          }`}
        >
          {b.label}
        </button>
      ))}
      <span className="ml-auto text-[11px] text-ink-4 whitespace-nowrap">D 다운 · U 업 · &gt; 강세</span>
    </div>
  );
}
