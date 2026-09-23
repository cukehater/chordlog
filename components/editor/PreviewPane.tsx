'use client';

import type { Song } from '@/lib/types';
import { Sheet, strumBlocks } from '@/components/sheet/Sheet';
import { StrumGrid, patternName } from '@/components/sheet/StrumGrid';

/** 이번 범위에서는 파싱하지 않는다 — 고정 블록을 그린다.
 *  파서가 붙으면 blocks를 parse(source)로 바꾸는 것이 전부다. */
export function PreviewPane({ song, errorLines = [] }: { song: Song; errorLines?: number[] }) {
  const patterns = strumBlocks(song.blocks);

  return (
    <section className="flex flex-col bg-surface overflow-hidden">
      <div className="shrink-0 h-10 px-7 flex items-center gap-3 border-b border-line-soft">
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-dim">PREVIEW</span>
        <span className="text-[11.5px] text-hairline">입력을 멈추면 0.3초 뒤 갱신</span>
        <span className="ml-auto font-mono text-[11px] text-dim">
          {song.key} · CAPO {song.capo}프렛 · {song.tuning.replace(/\s/g, '')}
        </span>
      </div>

      <div className="grow p-[22px_28px] flex flex-col gap-4 overflow-auto">
        {patterns.map((p, i) => (
          <StrumGrid key={i} name={patternName(i)} use={p.use} slots={p.slots} />
        ))}
        <Sheet blocks={song.blocks} semi={0} fontSize={15} cols={1} errorLines={errorLines} />
      </div>
    </section>
  );
}
