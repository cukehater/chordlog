'use client';

export function Stepper({
  value, sub, onDec, onInc, decLabel, incLabel, size = 'bar',
}: {
  value: string; sub?: string;
  onDec: () => void; onInc: () => void;
  decLabel: string; incLabel: string; size?: 'bar' | 'dock';
}) {
  const btn = size === 'dock'
    ? 'w-11 h-11 rounded-[9px] text-[17px]'
    : 'w-9 h-full text-[16px] hover:bg-surface-2';
  const box = size === 'dock'
    ? 'bg-dock-well border-line rounded-[11px] overflow-hidden'
    : 'h-9 bg-bg border-line rounded-md overflow-hidden divide-x divide-line';
  const valueW = size === 'dock' ? 'w-9' : 'min-w-[56px] h-full justify-center';

  return (
    <div className={`flex items-center border ${box}`}>
      <button type="button" aria-label={decLabel} onClick={onDec}
        className={`${btn} flex items-center justify-center text-ink-2 cursor-pointer`}>−</button>
      <span className={`${valueW} text-center flex flex-col items-center leading-[1.15]`}>
        <span className={`text-[13px] font-bold tabular-nums ${size === 'dock' ? 'text-ink' : 'text-accent'}`}>{value}</span>
        {sub ? <span className="text-[11px] text-ink-5">{sub}</span> : null}
      </span>
      <button type="button" aria-label={incLabel} onClick={onInc}
        className={`${btn} flex items-center justify-center text-ink-2 cursor-pointer`}>+</button>
    </div>
  );
}
