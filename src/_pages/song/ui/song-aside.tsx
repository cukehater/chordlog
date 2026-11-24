import type { ReactNode } from 'react'

import {
  Fretboard,
  patternName,
  type SongType,
  STANDARD_TUNING,
  strumBlocks,
  StrumGrid,
} from '@/entities/song'
import { keyLabel } from '@/shared/lib/chordpro'
import { withContentKeys } from '@/shared/lib/content-keys'

const Card = ({
  title,
  meta,
  children,
}: {
  title: string
  meta?: ReactNode
  children: ReactNode
}) => {
  return (
    <section className="border border-line rounded-xl p-4 flex flex-col gap-3">
      <h2 className="m-0 flex items-baseline justify-between gap-3 text-[14px] font-bold text-ink">
        <span className="shrink-0">{title}</span>
        {meta ? <span className="text-[12px] font-normal text-ink-5">{meta}</span> : null}
      </h2>
      {children}
    </section>
  )
}

export const SongAside = ({ song, semi }: { song: SongType; semi: number }) => {
  const patterns = strumBlocks(song.blocks)

  return (
    <aside className="shrink-0 w-[300px] flex flex-col gap-4 overflow-y-auto pb-10">
      <Card meta={song.capo > 0 ? `${song.capo}프렛` : '없음'} title="카포">
        <Fretboard fret={song.capo} size="rail" />
        <p className="m-0 text-[13px] leading-[1.6] text-ink-4">
          {song.capo > 0
            ? `${song.capo}프렛에 카포를 끼우고 악보의 코드 모양 그대로 잡으세요.`
            : '카포 없이 악보의 코드 모양 그대로 잡으세요.'}
          {song.tuning !== STANDARD_TUNING ? ` 튜닝은 ${song.tuning}입니다.` : ''}
        </p>
      </Card>

      {withContentKeys(patterns, (p) => p.use).map(({ item: p, key }, i) => (
        <StrumGrid key={key} name={patternName(i)} slots={p.slots} use={p.use} />
      ))}

      {song.note ? (
        <Card title="연습 메모">
          <p className="m-0 text-[13.5px] leading-[1.7] text-ink-3">{song.note}</p>
          {song.reference ? (
            <a
              className="text-[13px] font-medium no-underline"
              href={song.reference}
              rel="noreferrer"
              target="_blank"
            >
              원본 영상 보기 ↗
            </a>
          ) : null}
        </Card>
      ) : null}

      <p className="m-0 text-[12px] leading-[1.6] text-ink-5">
        이 키로 다시 열기{' '}
        <span className="font-mono text-ink-3 break-all">
          /songs/{song.slug}
          {semi !== 0 ? `?key=${keyLabel(semi)}` : ''}
        </span>
        <br />
        오토스크롤·메트로놈은 저장되지 않습니다.
      </p>
    </aside>
  )
}
