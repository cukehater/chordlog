import Link from 'next/link';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { Wordmark } from '@/components/chrome/Wordmark';
import { ContinueCard } from '@/components/song/ContinueCard';
import { TrackList } from '@/components/song/TrackList';
import { FilterChips } from '@/components/song/FilterChips';
import { SearchIcon, ThemeIcon, PlusIcon } from '@/components/icons';
import { MOCK_SONGS, MOCK_STATS, CONTINUE_SONG } from '@/lib/mock/songs';
import { IS_ADMIN } from '@/lib/mock/flags';

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <SiteHeader
        variant="list"
        actions={
          <>
            <div className="w-[280px] relative flex items-center">
              <SearchIcon className="absolute left-3 text-ink-5" />
              <label htmlFor="q" className="sr-only">곡 검색</label>
              <input
                id="q" type="search" placeholder="제목 · 아티스트"
                className="w-full h-[36px] pl-9 pr-3 border border-line rounded-md bg-surface-2 text-[13.5px] text-ink outline-none"
              />
            </div>
            {IS_ADMIN ? (
              <Link
                href="/songs/new"
                className="h-[36px] flex items-center gap-[7px] px-4 bg-accent text-accent-ink rounded-md text-[13.5px] font-bold no-underline"
              >
                <PlusIcon />새 곡
              </Link>
            ) : null}
          </>
        }
      />

      {/* 모바일 상단 — 상태바 자리 52px를 비워 둔다 */}
      <header className="md:hidden shrink-0 pt-[56px] px-5 pb-4 flex flex-col gap-[18px]">
        <div className="flex items-center gap-[10px]">
          <Wordmark />
          <button
            type="button" aria-label="화면 테마 전환"
            className="ml-auto w-11 h-11 flex items-center justify-center border-0 bg-transparent text-ink-3 cursor-pointer"
          >
            <ThemeIcon size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-[0.18em] text-accent">{MOCK_STATS.total} SONGS</span>
          <h1 className="m-0 font-display text-[32px] font-bold tracking-[-0.03em] leading-none">내 코드 악보</h1>
        </div>
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-[14px] text-ink-5" />
          <label htmlFor="mq" className="sr-only">곡 검색</label>
          <input
            id="mq" type="search" placeholder="제목 · 아티스트"
            className="w-full h-[46px] pl-10 pr-[14px] border border-line rounded-lg bg-surface-2 text-[15px] text-ink outline-none"
          />
        </div>
      </header>

      <main className="grow flex flex-col gap-[26px] px-5 md:px-[48px] pt-0 md:pt-10 pb-[44px]">
        <div className="hidden md:flex items-end justify-between gap-6">
          <div className="flex flex-col gap-[10px]">
            <span className="font-mono text-[11px] tracking-[0.16em] text-accent">
              {MOCK_STATS.total} SONGS · {MOCK_STATS.practicing} IN PRACTICE
            </span>
            <h1 className="m-0 font-display text-[46px] font-bold tracking-[-0.03em] leading-none">내 코드 악보</h1>
          </div>
          <div className="flex items-center gap-[10px] pb-[6px]">
            <label htmlFor="sort" className="font-mono text-[11px] tracking-[0.1em] text-dim">SORT</label>
            <select id="sort" className="h-[34px] px-[10px] border border-line rounded-lg bg-surface-2 text-[13px] text-ink-2">
              <option>최근 수정순</option><option>제목순</option><option>등록순</option>
            </select>
          </div>
        </div>

        <div className="hidden md:block">
          <ContinueCard song={CONTINUE_SONG} />
        </div>

        <FilterChips groups={[{ items: ['전체', '포크', '발라드', '시티팝'] }, { items: ['연습중', '완성', '보관'] }]} />

        <TrackList songs={MOCK_SONGS} />
      </main>

      {IS_ADMIN ? (
        <Link
          href="/songs/new"
          aria-label="새 곡 등록"
          className="md:hidden fixed right-5 bottom-[30px] w-14 h-14 rounded-[18px] bg-accent text-accent-ink flex items-center justify-center no-underline shadow-fab"
        >
          <PlusIcon size={22} />
        </Link>
      ) : null}
    </div>
  );
}
