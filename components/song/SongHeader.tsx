import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Song } from '@/lib/types';
import { STATUS_LABEL } from '@/lib/types';
import { transposeChord, keyLabel } from '@/lib/chordpro/transpose';

const STATUS_CHIP: Record<Song['status'], string> = {
  practicing: 'bg-accent-soft text-accent',
  done: 'bg-done-soft text-done',
  archived: 'bg-surface-2 text-ink-5',
};

function Chip({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <span className="h-7 px-[10px] rounded-sm bg-surface-2 text-[13px] text-ink-2 inline-flex items-center gap-[6px]">
      {label ? <span className="text-ink-5">{label}</span> : null}
      {children}
    </span>
  );
}

export function SongHeader({ song, semi, actions }: { song: Song; semi: number; actions?: ReactNode }) {
  const current = transposeChord(song.key, semi);

  return (
    <header className="shrink-0 w-full max-w-[1360px] mx-auto box-border px-10 pt-7 pb-5">
      <nav aria-label="경로" className="text-[13px] text-ink-5 mb-2">
        <Link href="/songs" className="text-ink-5 no-underline hover:text-ink-2">내 곡</Link>
        <span className="mx-[6px]">/</span>
        {song.artist}
      </nav>
      <h1 className="m-0 text-[28px] font-bold leading-[1.25] tracking-[-0.01em] text-ink">{song.title}</h1>
      <p className="m-0 mt-1 text-[16px] text-ink-5">
        by <span className="text-accent font-medium">{song.artist}</span>
        <span className="text-[13px]"> · {song.updatedLabel} 수정</span>
      </p>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <Chip label="Key">
          <b data-original-key className="font-bold">{song.key}</b>
          {semi !== 0 ? (
            <>
              <span aria-hidden="true" className="text-ink-5">→</span>
              <b data-current-key className="font-bold text-accent">{current}</b>
              <span className="text-ink-5 tabular-nums">{keyLabel(semi)}</span>
            </>
          ) : null}
        </Chip>
        <Chip label="Capo"><b className="font-bold">{song.capo > 0 ? `${song.capo}프렛` : '없음'}</b></Chip>
        <Chip label="Tuning"><b className="font-mono font-semibold tracking-[0.08em]">{song.tuning}</b></Chip>
        <Chip><b className="font-bold tabular-nums">{song.tempo}</b><span className="text-ink-5">BPM</span></Chip>
        <span className={`h-7 px-[10px] rounded-sm text-[13px] font-medium inline-flex items-center ${STATUS_CHIP[song.status]}`}>
          {STATUS_LABEL[song.status]}
        </span>
        {song.tags.map((t) => (
          <Link key={t} href={`/tags/${encodeURIComponent(t)}`}
            className="h-7 px-[10px] rounded-sm border border-line text-[13px] text-ink-4 inline-flex items-center no-underline hover:border-line-strong">
            #{t}
          </Link>
        ))}
        {actions ? <div className="ml-auto flex gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
