import Link from 'next/link';
import { splitName } from '@/lib/site';

export function Wordmark() {
  const [head, tail] = splitName();
  return (
    <Link href="/songs" className="no-underline text-ink font-display text-[22px] font-semibold tracking-[-0.03em]">
      {head}
      {tail ? <span className="font-medium italic text-accent">{tail}</span> : null}
    </Link>
  );
}
