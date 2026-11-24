import { withContentKeys } from '@/shared/lib/content-keys'

import { STANDARD_TUNING } from '../model/types'

const SIZE = {
  rail: { box: 'w-[28px] h-[28px] text-[13px]', gap: 'gap-[6px]' },
  hero: { box: 'w-[25px] h-[27px] text-[12.5px]', gap: 'gap-[5px]' },
  editor: { box: 'w-[24px] h-[26px] text-[12px]', gap: 'gap-[5px]' },
}

/** 표준 튜닝과 다른 줄만 앰버로 강조한다. 배열 순서는 6번줄(low E) → 1번줄. */
export const TuningTokens = ({
  tuning,
  size = 'rail',
  showStringNumbers = false,
}: {
  tuning: string
  size?: keyof typeof SIZE
  showStringNumbers?: boolean
}) => {
  const notes = tuning.trim().split(/\s+/)
  const standard = STANDARD_TUNING.split(' ')
  const s = SIZE[size]

  return (
    <span className={`flex items-end ${s.gap}`}>
      {withContentKeys(notes, (n) => n).map(({ item: note, key }, i) => {
        const changed = note !== standard[i]
        return (
          <span key={key} className="flex flex-col items-center gap-[4px]">
            <span
              className={`${s.box} flex items-center justify-center border rounded-lg font-mono font-medium ${
                changed ? 'border-accent/35 text-accent' : 'border-line-strong text-ink-2'
              }`}
              data-changed={changed}
            >
              {note}
            </span>
            {showStringNumbers ? (
              <span data-string-number className="font-mono text-[9px] text-hairline">
                {6 - i}
              </span>
            ) : null}
          </span>
        )
      })}
    </span>
  )
}
