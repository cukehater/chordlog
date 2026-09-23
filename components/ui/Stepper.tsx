'use client';

export function Stepper({
  value, sub, onDec, onInc, decLabel, incLabel, size = 'bar',
}: {
  value: string; sub?: string;
  onDec: () => void; onInc: () => void;
  decLabel: string; incLabel: string; size?: 'bar' | 'dock';
}) {
  const btn = size === 'dock'
    ? 'w-[46px] h-[44px] rounded-[9px] text-[17px]'
    : 'w-[30px] h-[28px] rounded-[6px] text-[16px]';
  const box = size === 'dock'
    ? 'bg-dock-well border-line rounded-[11px] p-[2px] gap-px'
    : 'bg-bg border-line rounded-md p-[3px] gap-[2px]';
  const valueW = size === 'dock' ? 'w-[46px]' : 'min-w-[56px]';

  return (
    <div className={`flex items-center border ${box}`}>
      <button type="button" aria-label={decLabel} onClick={onDec}
        className={`${btn} flex items-center justify-center text-ink-2 cursor-pointer`}>−</button>
      <span className={`${valueW} text-center flex flex-col items-center leading-[1.15]`}>
        <span className="font-mono text-[13px] font-bold text-ink">{value}</span>
        {sub ? <span className="font-mono text-[8.5px] tracking-[0.1em] text-dim">{sub}</span> : null}
      </span>
      <button type="button" aria-label={incLabel} onClick={onInc}
        className={`${btn} flex items-center justify-center text-ink-2 cursor-pointer`}>+</button>
    </div>
  );
}
