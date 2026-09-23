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
            <span className="font-display text-[17px] font-semibold tracking-[-0.015em] truncate">{song.title}</span>
            <span className="font-mono text-[10.5px] tracking-[0.06em] text-ink-5">{song.artist} · 원키 {song.key}</span>
          </span>
          <button type="button" aria-label="메트로놈 소리 켜고 끄기" aria-pressed={view.muted} onClick={view.toggleMute}
            className={`w-11 h-11 flex items-center justify-center border-0 bg-transparent cursor-pointer ${view.muted ? 'text-dim' : 'text-ink-2'}`}>
            {view.muted ? <SoundOffIcon size={18} /> : <SoundOnIcon size={18} />}
          </button>
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="flex items-center gap-[7px] border border-line-chip rounded-md px-[9px] py-[5px]">
            <Fretboard fret={song.capo} size="row" />
            <span className="font-mono text-[11px] font-bold text-ink-2">{song.capo}F</span>
          </span>
          <span className="flex items-center gap-[7px] border border-line-chip rounded-md px-[10px] py-[7px]">
            <span className="font-mono text-[9px] tracking-[0.12em] text-dim">TUNING</span>
            <span className="font-mono text-[11px] font-medium text-ink-2">{song.tuning}</span>
          </span>
        </div>
      </header>

      <div className="grow flex flex-col gap-4 px-3 pt-3 pb-[150px] overflow-hidden">
        {pattern ? (
          <div className="flex flex-col gap-2">
            {patterns.length > 1 ? (
              <div className="flex justify-end">
                <span className="flex items-center border border-line-strong rounded-sm overflow-hidden">
                  {patterns.map((_, i) => (
                    <button key={i} type="button" onClick={() => setPatternIdx(i)}
                      aria-pressed={i === patternIdx}
                      className={`w-11 h-11 text-[12px] font-bold cursor-pointer ${
                        i === patternIdx ? 'bg-accent text-accent-ink' : 'bg-transparent text-ink-4'
                      }`}>
                      {String.fromCharCode(65 + i)}
                    </button>
                  ))}
                </span>
              </div>
            ) : null}
            <StrumGrid name={patternName(patternIdx)} use={pattern.use} slots={pattern.slots} size="mobile" />
            <span className="text-[10.5px] text-faint">↓ 다운 · ↑ 업 · 주황은 강세</span>
          </div>
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
