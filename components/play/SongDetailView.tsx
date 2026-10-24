'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { Song } from '@/lib/types';
import { usePlayView } from '@/lib/ui/playView';
import { keyLabel } from '@/lib/chordpro/transpose';
import { Sheet } from '@/components/sheet/Sheet';
import { SongHeader } from '@/components/song/SongHeader';
import { SongAside } from '@/components/song/SongAside';
import { ControlBar } from '@/components/play/ControlBar';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { MobilePlayView } from '@/components/play/MobilePlayView';
import { IS_ADMIN } from '@/lib/mock/flags';
import { PlusIcon } from '@/components/icons';

export function SongDetailView({ song, initialSemi }: { song: Song; initialSemi: number }) {
  const view = usePlayView({ tempo: song.tempo, initialSemi });

  // 키 상태만 주소에 남긴다. 오토스크롤·메트로놈은 공유할 값이 아니다.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (view.semi === 0) url.searchParams.delete('key');
    else url.searchParams.set('key', keyLabel(view.semi));
    window.history.replaceState(null, '', url);
  }, [view.semi]);

  return (
    <>
      <div className="hidden md:contents" data-desktop-view>
        <div className="h-dvh flex flex-col bg-bg">
          {/* 집중 모드는 내비와 곡 머리만 숨긴다. 툴바와 카포·패턴 카드는 연주 중에 필요하다 */}
          {!view.focus ? (
            <>
              <SiteHeader
                variant="detail"
                crumb={song.title}
                actions={
                  IS_ADMIN ? (
                    <Link href="/songs/new"
                      className="h-9 flex items-center gap-[7px] px-4 bg-accent text-accent-ink rounded-md text-[14px] font-medium no-underline hover:bg-accent-deep hover:text-accent-ink">
                      <PlusIcon />새 곡
                    </Link>
                  ) : null
                }
              />
              <SongHeader
                song={song}
                semi={view.semi}
                actions={
                  IS_ADMIN ? (
                    <Link href={`/songs/${song.slug}/edit`}
                      className="h-9 px-4 flex items-center border border-line rounded-md bg-bg text-[14px] font-medium text-ink-2 no-underline hover:bg-surface-2">
                      편집
                    </Link>
                  ) : null
                }
              />
            </>
          ) : null}

          <ControlBar song={song} view={view} />

          <main className="grow min-h-0 w-full max-w-[1360px] mx-auto box-border px-10 pt-7 flex gap-8 min-[1100px]:gap-[60px]">
            <Sheet
              containerRef={view.sheetRef}
              blocks={song.blocks}
              semi={view.semi}
              fontSize={view.fontSize}
              cols={view.cols}
            />
            <SongAside song={song} semi={view.semi} />
          </main>
        </div>
      </div>
      <div className="md:hidden">
        <MobilePlayView song={song} view={view} />
      </div>
    </>
  );
}
