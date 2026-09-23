import Link from 'next/link';
import type { Song } from '@/lib/types';
import { STANDARD_TUNING } from '@/lib/types';
import { transposeChord, keyLabel } from '@/lib/chordpro/transpose';
import { MicroLabel } from '@/components/ui/MicroLabel';
import { StatusMark } from '@/components/ui/StatusMark';
import { TuningTokens } from '@/components/song/TuningTokens';
import { Fretboard } from '@/components/song/Fretboard';

export function InfoRail({ song, semi }: { song: Song; semi: number }) {
  const current = transposeChord(song.key, semi);

  return (
    <aside className="shrink-0 w-[352px] box-border p-[32px_32px_32px_48px] border-r border-line-header flex flex-col gap-5 overflow-hidden">
      <div className="flex flex-col gap-[11px]">
        <Link href="/" className="font-mono text-[11px] tracking-[0.1em] text-ink-4 no-underline">← ALL SONGS</Link>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusMark status={song.status} variant="pill" />
          {song.tags.map((t) => (
            <span key={t} className="text-[12px] text-ink-4 border border-line-chip rounded-pill px-[11px] py-[4px]">{t}</span>
          ))}
        </div>
        <h1 className="m-0 font-display text-[36px] font-bold tracking-[-0.03em] leading-[1.15]">{song.title}</h1>
        <span className="text-[15px] text-ink-3">{song.artist}</span>
      </div>

      <div className="h-px bg-line-header" />

      <div className="flex flex-col gap-[9px]">
        <MicroLabel>KEY</MicroLabel>
        <div className="flex items-baseline gap-3">
          <span data-original-key className="font-mono text-[19px] font-medium text-ink-5">{song.key}</span>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth={1.6}
            aria-hidden="true" className="self-center text-faint">
            <path d="M1 6h14" /><path d="m11 2 4 4-4 4" />
          </svg>
          <span data-current-key className="font-mono text-[32px] font-bold leading-none text-accent">{current}</span>
          {semi !== 0 ? <span className="font-mono text-[13px] text-ink-4">{keyLabel(semi)}</span> : null}
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        <MicroLabel>TUNING</MicroLabel>
        <div className="flex items-end gap-[6px]">
          <TuningTokens tuning={song.tuning} size="rail" showStringNumbers />
          <span className="text-[12px] text-ink-5 pb-[15px] ml-[2px]">
            {song.tuning === STANDARD_TUNING ? '표준' : '비표준'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-[11px] bg-surface-2 border border-line rounded-[14px] p-[15px_17px]">
        <div className="flex items-baseline justify-between">
          <MicroLabel>CAPO</MicroLabel>
          <span className="font-mono text-[15px] font-bold text-ink">
            {song.capo > 0 ? `${song.capo}프렛` : '없음'}
          </span>
        </div>
        <Fretboard fret={song.capo} size="rail" />
        <span className="text-[12px] leading-[1.6] text-ink-4">
          {song.capo > 0
            ? `${song.capo}프렛에 카포를 끼우고 아래 코드 모양 그대로 잡으세요.`
            : '카포 없이 아래 코드 모양 그대로 잡으세요.'}
        </span>
      </div>

      <div className="flex items-center gap-[22px]">
        <div className="flex flex-col gap-[5px]">
          <MicroLabel>TEMPO</MicroLabel>
          <span className="font-mono text-[16px] font-medium text-ink-2">{song.tempo} BPM</span>
        </div>
        <div className="flex flex-col gap-[5px]">
          <MicroLabel>UPDATED</MicroLabel>
          <span className="font-mono text-[16px] font-medium text-ink-2">{song.updatedLabel}</span>
        </div>
      </div>

      {song.note ? (
        <div className="mt-auto flex flex-col gap-[10px] border-t border-line-header pt-[18px]">
          <MicroLabel>PRACTICE NOTE</MicroLabel>
          <p className="m-0 text-[13.5px] leading-[1.75] text-ink-3">{song.note}</p>
          {song.reference ? (
            <a href={song.reference} className="text-[13px] no-underline" target="_blank" rel="noreferrer">
              원본 영상 ↗
            </a>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
