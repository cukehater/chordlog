'use client'

import { patternName, Sheet, type SongType, strumBlocks, StrumGrid } from '@/entities/song'
import { withContentKeys } from '@/shared/lib/content-keys'

/** 이번 범위에서는 파싱하지 않는다 — 고정 블록을 그린다.
 *  파서가 붙으면 blocks를 parse(source)로 바꾸는 것이 전부다. */
export const PreviewPane = ({
  song,
  errorLines = [],
}: {
  song: SongType
  errorLines?: number[]
}) => {
  const patterns = strumBlocks(song.blocks)

  return (
    <section className="flex flex-col bg-surface overflow-hidden">
      <div className="shrink-0 h-10 px-7 flex items-center gap-3 border-b border-line-soft">
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-dim">PREVIEW</span>
        <span className="text-[11.5px] text-ink-4">입력을 멈추면 0.3초 뒤 갱신</span>
        <span className="ml-auto font-mono text-[11px] text-dim">
          {song.key} · CAPO {song.capo}프렛 · {song.tuning.replace(/\s/g, '')}
        </span>
      </div>

      <div className="grow p-[22px_28px] flex flex-col gap-4 overflow-auto">
        {withContentKeys(patterns, (p) => p.use).map(({ item: p, key }, i) => (
          <StrumGrid key={key} name={patternName(i)} slots={p.slots} use={p.use} />
        ))}
        <Sheet blocks={song.blocks} cols={1} errorLines={errorLines} fontSize={15} semi={0} />
      </div>
    </section>
  )
}
