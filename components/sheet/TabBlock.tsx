const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E'];

export function TabBlock({
  title, repeat, lines,
}: { title: string; repeat: string; lines: string[] }) {
  return (
    <div className="bg-surface-2 rounded-lg p-[12px_14px] my-2 flex flex-col gap-[7px]">
      <div className="flex items-center gap-[9px]">
        <span className="text-[0.62em] font-bold tracking-[0.06em] text-accent">TAB</span>
        <span className="text-[0.66em] font-medium text-ink-3">{title}</span>
        {repeat ? (
          <span className="ml-auto text-[0.62em] font-bold tabular-nums text-ink-3 bg-bg border border-line rounded-xs px-[7px] py-[2px]">
            {repeat}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col">
        {lines.map((t, i) => (
          <span key={i} data-tab-row className="flex font-mono text-[0.66em] leading-[1.6]">
            <span className="w-[1.3em] text-ink-5">{STRING_NAMES[i] ?? ''}</span>
            <span className="text-faint">|</span>
            <span className="whitespace-pre text-tab">{t}</span>
            <span className="text-faint">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
