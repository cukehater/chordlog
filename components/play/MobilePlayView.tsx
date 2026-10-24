'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Song } from '@/lib/types';
import type { usePlayView } from '@/lib/ui/playView';
import { Sheet, strumBlocks } from '@/components/sheet/Sheet';
import { StrumGrid, patternName } from '@/components/sheet/StrumGrid';
import { MobileDock } from '@/components/play/MobileDock';
import { Fretboard } from '@/components/song/Fretboard';
import { ChevronLeftIcon, SoundOnIcon, SoundOffIcon } from '@/components/icons';

type View = ReturnType<typeof usePlayView>;

export function MobilePlayView({ song, view }: { song: Song; view: View }) {
  const patterns = strumBlocks(song.blocks);
  const [patternIdx, setPatternIdx] = useState(0);
  const pattern = patterns[patternIdx];

  return (
    <div className="h-dvh flex flex-col bg-bg">
      <header className="shrink-0 pt-[52px] px-3 pb-[10px] flex flex-col gap-2 border-b border-line-hair">
        <div className="flex items-center gap-1">
          <Link href="/" aria-label="목록으로" className="w-11 h-11 flex items-center justify-center no-underline text-ink-3">
            <ChevronLeftIcon />
          </Link>
          <span className="flex flex-col gap-[2px] grow min-w-0">
            <span className="text-[17px] font-bold tracking-[-0.01em] truncate">{song.title}</span>
            <span className="text-[13px] text-ink-4">{song.artist} · 원키 {song.key}</span>
          </span>
          <button type="button" aria-label="메트로놈 음소거" aria-pressed={view.muted} onClick={view.toggleMute}
            className={`w-11 h-11 flex items-center justify-center border-0 bg-transparent cursor-pointer ${view.muted ? 'text-dim' : 'text-ink-2'}`}>
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

      <div className="grow flex flex-col gap-4 px-3 pt-3 pb-[150px] overflow-hidden">
        {pattern ? (
          <StrumGrid
            name={patternName(patternIdx)} use={pattern.use} slots={pattern.slots} size="mobile"
            action={patterns.length > 1 ? (
              <span className="shrink-0 flex border border-line rounded-md overflow-hidden divide-x divide-line">
                {patterns.map((_, i) => (
                  <button key={i} type="button" onClick={() => setPatternIdx(i)}
                    aria-pressed={i === patternIdx} aria-label={`${patternName(i)} 보기`}
                    className={`w-11 h-11 text-[13px] font-bold cursor-pointer ${
                      i === patternIdx ? 'bg-accent text-accent-ink' : 'bg-bg text-ink-4'
                    }`}>
                    {String.fromCharCode(65 + i)}
                  </button>
                ))}
              </span>
            ) : null}
          />
        ) : null}

        <Sheet
          containerRef={view.sheetRef}
          blocks={song.blocks}
          semi={view.semi}
          fontSize={view.fontSize}
          cols={1}
        />
      </div>

      <MobileDock song={song} view={view} />
    </div>
  );
}
