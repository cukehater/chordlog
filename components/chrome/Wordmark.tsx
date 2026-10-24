import Link from 'next/link';

export function Wordmark() {
  return (
    <Link href="/" className="no-underline text-ink text-[20px] font-bold tracking-[-0.02em]">
      코드<span className="text-accent">집</span>
    </Link>
  );
}
