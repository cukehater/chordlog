'use client'

import Link from 'next/link'
import { useState } from 'react'

import {
  Fretboard,
  patternName,
  Sheet,
  type SongType,
  strumBlocks,
  StrumGrid,
} from '@/entities/song'
import { withContentKeys } from '@/shared/lib/content-keys'
import { ChevronLeftIcon, SoundOffIcon, SoundOnIcon } from '@/shared/ui/icons'

import type { usePlayView } from '../model/play-view'
import { MobileDock } from './mobile-dock'

type ViewType = ReturnType<typeof usePlayView>

export const MobilePlayView = ({ song, view }: { song: SongType; view: ViewType }) => {
  const patterns = strumBlocks(song.blocks)
  const [patternIdx, setPatternIdx] = useState(0)
  const pattern = patterns[patternIdx]

  return (
    <div className="h-dvh flex flex-col bg-bg">
      <header className="shrink-0 pt-[52px] page-grid pb-[10px] flex flex-col gap-2 border-b border-line-hair">
        <div className="flex items-center gap-1">
          <Link
            aria-label="목록으로"
            className="w-11 h-11 flex items-center justify-center no-underline text-ink-3"
            href="/songs"
          >
            <ChevronLeftIcon />
          </Link>
          <span className="flex flex-col gap-[2px] grow min-w-0">
            <span className="text-[17px] font-bold tracking-[-0.01em] truncate">{song.title}</span>
            <span className="text-[13px] text-ink-4">
              {song.artist} · 원키 {song.key}
            </span>
          </span>
          <button
            aria-label="메트로놈 음소거"
            aria-pressed={view.muted}
            className={`w-11 h-11 flex items-center justify-center border-0 bg-transparent cursor-pointer ${view.muted ? 'text-dim' : 'text-ink-2'}`}
            type="button"
            onClick={view.handleToggleMute}
          >
            {view.muted ? <SoundOffIcon size={18} /> : <SoundOnIcon size={18} />}
          </button>
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="h-7 flex items-center gap-[6px] rounded-sm bg-surface-2 px-[10px] text-[13px] text-ink-2">
            <Fretboard fret={song.capo} size="row" />
            <span className="text-ink-5">카포</span>
            <b className="font-bold">{song.capo > 0 ? `${song.capo}프렛` : '없음'}</b>
          </span>
          <span className="h-7 flex items-center gap-[6px] rounded-sm bg-surface-2 px-[10px] text-[13px] text-ink-2">
            <span className="text-ink-5">튜닝</span>
            <b className="font-mono font-semibold tracking-[0.06em]">{song.tuning}</b>
          </span>
        </div>
      </header>

      <div className="grow flex flex-col gap-4 page-grid pt-3 pb-[150px] overflow-hidden">
        {pattern ? (
          <StrumGrid
            action={
              patterns.length > 1 ? (
                <span className="shrink-0 flex border border-line rounded-md overflow-hidden divide-x divide-line">
                  {withContentKeys(patterns, (p) => p.use).map(({ key }, i) => (
                    <button
                      key={key}
                      aria-label={`${patternName(i)} 보기`}
                      aria-pressed={i === patternIdx}
                      className={`w-11 h-11 text-[13px] font-bold cursor-pointer ${
                        i === patternIdx ? 'bg-accent text-accent-ink' : 'bg-bg text-ink-4'
                      }`}
                      type="button"
                      onClick={() => setPatternIdx(i)}
                    >
                      {String.fromCharCode(65 + i)}
                    </button>
                  ))}
                </span>
              ) : null
            }
            name={patternName(patternIdx)}
            size="mobile"
            slots={pattern.slots}
            use={pattern.use}
          />
        ) : null}

        <Sheet
          blocks={song.blocks}
          cols={1}
          containerRef={view.sheetRef}
          fontSize={view.fontSize}
          semi={view.semi}
        />
      </div>

      <MobileDock song={song} view={view} />
    </div>
  )
}
