'use client';

export function Segmented({
  options, value, onChange, grow = false,
}: {
  options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void; grow?: boolean;
}) {
  return (
    <div className={`flex items-center border border-line rounded-md overflow-hidden divide-x divide-line ${grow ? 'w-full' : ''}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`h-[44px] md:h-9 px-3 text-[13px] cursor-pointer ${grow ? 'grow' : ''} ${
              on ? 'bg-accent text-accent-ink font-medium' : 'bg-bg text-ink-3 hover:bg-surface-2'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
