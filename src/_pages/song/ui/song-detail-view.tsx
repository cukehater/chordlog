'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { Sheet, type SongType } from '@/entities/song'
import { IS_ADMIN } from '@/shared/config'
import { keyLabel } from '@/shared/lib/chordpro'
import { PlusIcon } from '@/shared/ui/icons'
import { SiteHeader } from '@/widgets/site-header'

import { usePlayView } from '../model/play-view'
import { ControlBar } from './control-bar'
import { MobilePlayView } from './mobile-play-view'
import { SongAside } from './song-aside'
import { SongHeader } from './song-header'

export const SongDetailView = ({ song, initialSemi }: { song: SongType; initialSemi: number }) => {
  const view = usePlayView({ tempo: song.tempo, initialSemi })

  // 키 상태만 주소에 남긴다. 오토스크롤·메트로놈은 공유할 값이 아니다.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (view.semi === 0) url.searchParams.delete('key')
    else url.searchParams.set('key', keyLabel(view.semi))
    window.history.replaceState(null, '', url)
  }, [view.semi])

  return (
    <>
      <div data-desktop-view className="hidden md:contents">
        <div className="h-dvh flex flex-col bg-bg">
          {/* 집중 모드는 내비와 곡 머리만 숨긴다. 툴바와 카포·패턴 카드는 연주 중에 필요하다 */}
          {!view.focus ? (
            <>
              <SiteHeader
                actions={
                  IS_ADMIN ? (
                    <Link
                      className="h-9 flex items-center gap-[7px] px-4 bg-accent text-accent-ink rounded-md text-[14px] font-medium no-underline hover:bg-accent-hover hover:text-accent-ink"
                      href="/songs/new"
                    >
                      <PlusIcon />새 곡
                    </Link>
                  ) : null
                }
                crumb={song.title}
                variant="detail"
              />
              <SongHeader
                actions={
                  IS_ADMIN ? (
                    <Link
                      className="h-9 px-4 flex items-center border border-line rounded-md bg-bg text-[14px] font-medium text-ink-2 no-underline hover:bg-surface-2"
                      href={`/songs/${song.slug}/edit`}
                    >
                      편집
                    </Link>
                  ) : null
                }
                semi={view.semi}
                song={song}
              />
            </>
          ) : null}

          <ControlBar song={song} view={view} />

          <main className="grow min-h-0 page-grid pt-7 flex gap-8 min-[1100px]:gap-[60px]">
            <Sheet
              blocks={song.blocks}
              cols={view.cols}
              containerRef={view.sheetRef}
              fontSize={view.fontSize}
              semi={view.semi}
            />
            <SongAside semi={view.semi} song={song} />
          </main>
        </div>
      </div>
      <div className="md:hidden">
        <MobilePlayView song={song} view={view} />
      </div>
    </>
  )
}
