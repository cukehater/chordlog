'use client';

export function Segmented({
  options, value, onChange, grow = false,
}: {
  options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void; grow?: boolean;
}) {
  return (
    <div className={`flex items-center border border-line rounded-lg overflow-hidden ${grow ? 'w-full' : ''}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`h-[44px] md:h-[32px] px-[13px] text-[13px] cursor-pointer ${grow ? 'grow' : ''} ${
              on ? 'bg-accent text-accent-ink font-bold' : 'bg-transparent text-ink-4 font-medium'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
