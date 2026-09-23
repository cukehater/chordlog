import Link from 'next/link';
import { SiteHeader } from '@/components/chrome/SiteHeader';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <SiteHeader variant="bare" />
      <main className="grow flex flex-col items-center justify-center gap-4 px-5">
        <span className="font-mono text-[11px] tracking-[0.22em] text-accent">NOT FOUND</span>
        <h1 className="m-0 font-display text-[32px] font-bold tracking-[-0.03em]">그 곡은 서랍에 없어요</h1>
        <Link href="/" className="text-[13px] no-underline">← 곡 목록으로</Link>
      </main>
    </div>
  );
}
