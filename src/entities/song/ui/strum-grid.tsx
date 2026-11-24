import type { ReactNode } from 'react'

import { withContentKeys } from '@/shared/lib/content-keys'

import type { SlotType } from '../model/types'

const GLYPH = { D: '↓', U: '↑' } as const

const LABELS = ['1', 'e', '&', 'a', '2', 'e', '&', 'a', '3', 'e', '&', 'a', '4', 'e', '&', 'a']

export const StrumGrid = ({
  name,
  use,
  slots,
  size = 'desktop',
  action,
}: {
  name: string
  use: string
  slots: SlotType[]
  size?: 'desktop' | 'mobile'
  action?: ReactNode
}) => {
  const cell = size === 'desktop' ? 16 : 20

  return (
    <section className="border border-line rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h2 className="m-0 grow min-w-0 flex items-baseline justify-between gap-3 text-[14px] font-bold text-ink">
          <span className="shrink-0">{name}</span>
          <span className="min-w-0 text-[12px] font-normal text-ink-5 truncate" title={use}>
            {use}
          </span>
        </h2>
        {action}
      </div>
      <div className="flex">
        {withContentKeys(slots, (s) => `${s.stroke ?? '-'}${s.accent ? '>' : ''}`).map(
          ({ item: s, key }, i) => {
            const isBeat = i % 4 === 0
            const divider = isBeat && i > 0
            const glyph = s.stroke ? GLYPH[s.stroke] : '·'
            const isRest = s.stroke === null
            const accentTone = s.accent ? 'text-accent font-bold' : 'text-ink-2'
            return (
              <span
                key={key}
                data-slot
                className={`flex flex-col items-center gap-[6px] ${divider ? 'border-l border-line' : ''}`}
                data-beat-divider={divider}
                style={{ width: cell }}
              >
                <span
                  className={`leading-none ${isRest ? 'text-[12px] text-ink-5' : `text-[16px] ${accentTone}`}`}
                >
                  {glyph}
                </span>
                <span
                  className={`w-[10px] h-[2px] rounded-[1px] ${s.accent ? 'bg-accent' : 'bg-transparent'}`}
                  data-accent-bar={s.accent}
                />
                <span
                  className={`text-[11px] tabular-nums ${isBeat ? 'text-ink-2 font-bold' : 'text-ink-5'}`}
                >
                  {LABELS[i]}
                </span>
              </span>
            )
          },
        )}
      </div>
      <p className="m-0 text-[11.5px] text-ink-5">↓ 다운 · ↑ 업 · 앰버색은 강세</p>
    </section>
  )
}
