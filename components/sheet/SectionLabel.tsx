export function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-[18px] mb-[10px]">
      <span className="font-mono text-[0.62em] font-bold tracking-[0.18em] uppercase text-ink-5">{label}</span>
      <span className="grow h-px bg-line-grid" />
    </div>
  );
}
