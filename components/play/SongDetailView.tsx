'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { Song } from '@/lib/types';
import { usePlayView } from '@/lib/ui/playView';
import { keyLabel } from '@/lib/chordpro/transpose';
import { Sheet, strumBlocks } from '@/components/sheet/Sheet';
import { StrumGrid, patternName } from '@/components/sheet/StrumGrid';
import { InfoRail } from '@/components/song/InfoRail';
import { ControlBar } from '@/components/play/ControlBar';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { MobilePlayView } from '@/components/play/MobilePlayView';
import { IS_ADMIN } from '@/lib/mock/flags';

export function SongDetailView({ song, initialSemi }: { song: Song; initialSemi: number }) {
  const view = usePlayView({ tempo: song.tempo, initialSemi });
  const patterns = strumBlocks(song.blocks);

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
        <div className="min-h-dvh flex flex-col bg-bg">
      {!view.focus ? (
        <SiteHeader
          variant="detail"
          crumb={song.title}
          actions={
            IS_ADMIN ? (
              <Link href={`/songs/${song.slug}/edit`}
                className="h-[34px] flex items-center px-[14px] border border-line rounded-lg bg-surface-2 text-ink-2 text-[13px] font-medium no-underline">
                편집
              </Link>
            ) : null
          }
        />
      ) : null}

      <div className="grow flex overflow-hidden">
        {!view.focus ? (
          <div className="hidden min-[1100px]:flex">
            <InfoRail song={song} semi={view.semi} />
          </div>
        ) : null}

        <main className="grow box-border p-[24px_48px_30px_32px] flex flex-col gap-[14px] overflow-hidden">
          <ControlBar song={song} view={view} />

          {patterns.length ? (
            <section className="shrink-0 flex gap-[18px] flex-wrap">
              {patterns.map((p, i) => (
                <StrumGrid key={i} name={patternName(i)} use={p.use} slots={p.slots} />
              ))}
            </section>
          ) : null}

          <Sheet
            containerRef={view.sheetRef}
            blocks={song.blocks}
            semi={view.semi}
            fontSize={view.fontSize}
            cols={view.cols}
          />

          <div className="shrink-0 flex items-center gap-[10px] flex-wrap">
            <span className="font-mono text-[11px] text-faint">
              /songs/{song.slug}{view.semi !== 0 ? `?key=${keyLabel(view.semi)}` : ''}
            </span>
            <span className="text-[11.5px] text-faint">
              — 키 상태는 주소에 남습니다. 오토스크롤·메트로놈은 저장되지 않는 화면 상태예요.
            </span>
          </div>
        </main>
      </div>
        </div>
      </div>
      <div className="md:hidden">
        <MobilePlayView song={song} view={view} />
      </div>
    </>
  );
}
