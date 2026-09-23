import Link from 'next/link';

export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-[10px] no-underline text-ink">
      <span className="w-4 h-4 rounded-[4px] bg-accent block" />
      <span className="font-display text-[17px] font-bold tracking-[-0.01em]">코드집</span>
    </Link>
  );
}
