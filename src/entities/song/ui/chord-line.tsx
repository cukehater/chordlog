import { transposeChord } from '@/shared/lib/chordpro'
import { withContentKeys } from '@/shared/lib/content-keys'

import type { PairType } from '../model/types'

export const ChordLine = ({
  pairs,
  semi,
  hasError = false,
}: {
  pairs: PairType[]
  semi: number
  hasError?: boolean
}) => {
  return (
    <div
      className={`gc-line ${hasError ? 'border-l-2 border-danger bg-danger/7 pl-3 py-[6px]' : ''}`}
    >
      {withContentKeys(pairs, (p) => `${p.chord ?? ''}|${p.text}`).map(({ item: p, key }) => (
        <span key={key} className="gc-pair">
          <span className="chord">{p.chord ? transposeChord(p.chord, semi) : ''}</span>
          <span className="lyric">{p.text}</span>
        </span>
      ))}
    </div>
  )
}
