import Link from 'next/link';
import type { Song } from '@/lib/types';
import { STANDARD_TUNING, STATUS_LABEL } from '@/lib/types';
import { MicroLabel } from '@/components/ui/MicroLabel';
import { TuningTokens } from '@/components/song/TuningTokens';
import { Fretboard } from '@/components/song/Fretboard';
import { PlayIcon } from '@/components/icons';

export function ContinueCard({ song }: { song: Song }) {
  return (
    <section className="shrink-0 bg-surface-2 border border-line rounded-xl p-[26px_30px] flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-9">
      <div className="flex flex-col gap-[9px] grow min-w-0">
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-accent">CONTINUE PRACTICE</span>
        <h2 className="m-0 font-display text-[30px] font-bold tracking-[-0.025em] leading-[1.2]">{song.title}</h2>
        <div className="flex items-center gap-[10px]">
          <span className="text-[14px] text-ink-3">{song.artist}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-hairline" />
          <span className="text-[12.5px] text-ink-4">{song.updatedLabel} · {STATUS_LABEL[song.status]}</span>
        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-[7px] items-center px-[22px] border-l border-line">
        <MicroLabel className="tracking-[0.14em]">ORIGINAL KEY</MicroLabel>
        <span className="font-mono text-[30px] font-bold leading-none text-ink">{song.key}</span>
      </div>

      <div className="shrink-0 flex flex-col gap-[9px] items-center px-[22px] border-l border-r border-line">
        <MicroLabel className="tracking-[0.14em]">TUNING</MicroLabel>
        <TuningTokens tuning={song.tuning} size="hero" />
        <span className="text-[11px] text-dim">{song.tuning === STANDARD_TUNING ? '표준' : '비표준'}</span>
      </div>

      <div className="shrink-0 flex flex-col gap-[9px] items-center">
        <MicroLabel className="tracking-[0.14em]">CAPO</MicroLabel>
        <Fretboard fret={song.capo} size="hero" />
        <span className="font-mono text-[12px] font-medium text-ink-2">
          {song.capo > 0 ? `${song.capo}프렛` : '카포 없음'}
        </span>
      </div>

      <Link
        href={`/songs/${song.slug}`}
        className="shrink-0 h-[44px] flex items-center gap-2 px-5 bg-accent text-accent-ink rounded-[10px] text-[14px] font-bold no-underline"
      >
        <PlayIcon size={14} />연주 시작
      </Link>
    </section>
  );
}
