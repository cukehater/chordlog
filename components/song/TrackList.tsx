import Link from 'next/link';
import type { Song } from '@/lib/types';
import { STANDARD_TUNING, STATUS_LABEL } from '@/lib/types';
import { StatusMark } from '@/components/ui/StatusMark';
import { Badge } from '@/components/ui/Badge';

const GRID = 'grid-cols-[36px_minmax(0,1fr)_64px_92px_104px_84px] gap-4';

const STATUS_DOT: Record<Song['status'], string> = {
  practicing: 'bg-accent',
  done: 'bg-done',
  archived: 'bg-archived',
};

function tuningBadge(tuning: string): string | null {
  if (tuning === STANDARD_TUNING) return null;
  const notes = tuning.split(' ');
  const std = STANDARD_TUNING.split(' ');
  if (notes[0] === 'D' && notes.slice(1).join(' ') === std.slice(1).join(' ')) return 'DROP D';
  return '비표준';
}

function mobileMeta(song: Song): string {
  const parts = [song.artist];
  if (song.capo > 0) parts.push(`CAPO ${song.capo}프렛`);
  if (song.hasTab) parts.push('TAB');
  const badge = tuningBadge(song.tuning);
  if (badge) parts.push(badge);
  return parts.join(' · ');
}

export function TrackList({ songs }: { songs: Song[] }) {
  return (
    <div className="flex flex-col">
      {/* 데스크톱 헤더 행 */}
      <div className={`hidden md:grid ${GRID} items-center h-[30px] px-5 border-b border-line font-mono text-[10px] tracking-[0.14em] text-dim`}>
        <span>#</span>
        <span>TITLE</span>
        <span className="text-center">KEY</span>
        <span>CAPO</span>
        <span>STATUS</span>
        <span className="text-right">UPDATED</span>
      </div>

      {songs.map((song, i) => {
        const num = String(i + 1).padStart(2, '0');
        const badge = tuningBadge(song.tuning);
        return (
          <Link
            key={song.slug}
            href={`/songs/${song.slug}`}
            className="no-underline text-ink border-b border-line-hair"
          >
            {/* 데스크톱 행 62px */}
            <span className={`hidden md:grid ${GRID} items-center h-[62px] px-5`}>
              <span className="font-mono text-[12px] text-dim">{num}</span>
              <span className="flex items-baseline gap-[10px] min-w-0">
                <span className="font-display text-[17px] font-semibold tracking-[-0.015em]">{song.title}</span>
                <span className="text-[13px] text-ink-4">{song.artist}</span>
                {song.hasTab ? <Badge tone="accent">TAB</Badge> : null}
                {badge ? <Badge>{badge}</Badge> : null}
              </span>
              <span className="font-mono text-[12.5px] font-medium text-ink-2 border border-line-chip rounded-[6px] py-1 text-center">
                {song.key}
              </span>
              <span className={`font-mono text-[11.5px] ${song.capo > 0 ? 'text-ink-4' : 'text-dim'}`}>
                {song.capo > 0 ? `${song.capo}프렛` : '—'}
              </span>
              <StatusMark status={song.status} />
              <span className="font-mono text-[11.5px] text-dim text-right">{song.updatedLabel}</span>
            </span>

            {/* 모바일 행 68px */}
            <span className="flex md:hidden items-center gap-[14px] h-[68px]">
              <span className="font-mono text-[11.5px] text-dim w-5">{num}</span>
              <span className="flex flex-col gap-[3px] grow min-w-0">
                <span className="font-display text-[17px] font-semibold tracking-[-0.015em] truncate">{song.title}</span>
                <span className="font-mono text-[11px] text-ink-5 truncate">{mobileMeta(song)}</span>
              </span>
              <span className="shrink-0 flex items-center">
                <span aria-hidden="true" className={`w-[6px] h-[6px] rounded-full ${STATUS_DOT[song.status]}`} />
                <span className="sr-only">{STATUS_LABEL[song.status]}</span>
              </span>
              <span className="shrink-0 font-mono text-[13px] font-medium text-ink-2 w-[30px] text-right">{song.key}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
