import Link from 'next/link';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { MicroLabel } from '@/components/ui/MicroLabel';

export default function LoginPage() {
  return (
    <div className="relative min-h-dvh flex flex-col bg-bg overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'radial-gradient(680px 340px at 50% 22%, rgba(255,157,77,0.11), rgba(255,157,77,0) 72%)' }}
      />

      <div className="relative">
        <SiteHeader variant="bare" />
      </div>

      <main className="relative grow flex flex-col items-center justify-center gap-[40px] px-5 pb-[70px]">
        <div className="flex flex-col items-center gap-[14px] text-center">
          <span className="font-mono text-[11px] tracking-[0.22em] text-accent">ADMIN ACCESS</span>
          <h1 className="m-0 font-display text-[36px] md:text-[52px] font-bold tracking-[-0.035em] leading-none">
            한 사람을 위한 서랍
          </h1>
          <p className="m-0 text-[14.5px] text-ink-4">읽는 건 누구나. 쓰고 고치고 지우는 건 나만.</p>
        </div>

        <form className="w-full max-w-[380px] flex flex-col gap-[26px]">
          <div className="flex flex-col gap-[9px]">
            <MicroLabel as="label" htmlFor="pw">PASSWORD</MicroLabel>
            <input
              id="pw"
              type="password"
              autoComplete="current-password"
              className="h-[44px] p-0 border-0 border-b border-line-strong bg-transparent font-mono text-[20px] tracking-[0.14em] text-ink outline-none"
            />
          </div>

          <div className="flex items-center gap-[10px]">
            <input id="keep" type="checkbox" defaultChecked className="w-4 h-4 accent-accent" />
            <label htmlFor="keep" className="text-[13px] text-ink-4">30일 동안 로그인 유지</label>
          </div>

          <button
            type="submit"
            className="h-[48px] border-0 rounded-[10px] bg-accent text-accent-ink text-[15px] font-bold cursor-pointer"
          >
            로그인
          </button>

          <div className="flex items-center justify-between pt-[6px] border-t border-line-header">
            <Link href="/" className="text-[13px] no-underline pt-4">← 곡 목록으로</Link>
            <span className="font-mono text-[11px] text-faint pt-4">SINGLE ACCOUNT</span>
          </div>
        </form>
      </main>
    </div>
  );
}
