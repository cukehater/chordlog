import type { Pair } from '@/lib/types';
import { transposeChord } from '@/lib/chordpro/transpose';

export function ChordLine({
  pairs, semi, hasError = false,
}: { pairs: Pair[]; semi: number; hasError?: boolean }) {
  return (
    <div className={`gc-line ${hasError ? 'border-l-2 border-danger bg-danger/7 pl-3 py-[6px]' : ''}`}>
      {pairs.map((p, i) => (
        <span key={i} className="gc-pair">
          <span className="chord">{p.chord ? transposeChord(p.chord, semi) : ''}</span>
          <span className="lyric">{p.text}</span>
        </span>
      ))}
    </div>
  );
}
