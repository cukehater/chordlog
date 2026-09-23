const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const INDEX: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

/** 루트와 베이스만 반음 단위로 옮기고 퀄리티·텐션 문자열은 그대로 둔다.
 *  올리는 방향(+)은 샤프, 내리는 방향(-)은 플랫으로 표기한다.
 *  이명동음 예외(E# / Cb)는 v1에서 처리하지 않는다. (chordpro-spec.md §7) */
export function transposeChord(name: string, semi: number): string {
  if (semi === 0) return name;

  const m = /^([A-G][#b]?)([\s\S]*)$/.exec(name ?? '');
  if (!m) return name;

  const root = m[1];
  let rest = m[2] ?? '';
  let bass = '';
  const slash = rest.indexOf('/');
  if (slash >= 0) {
    bass = rest.slice(slash + 1);
    rest = rest.slice(0, slash);
  }

  const i = INDEX[root];
  if (i === undefined) return name;

  const scale = semi >= 0 ? SHARP : FLAT;
  const shift = (n: number) => scale[(((n + semi) % 12) + 12) % 12];

  let out = shift(i) + rest;
  if (bass) {
    const bi = INDEX[bass];
    out += '/' + (bi === undefined ? bass : shift(bi));
  }
  return out;
}

/** 컨트롤 바·독·URL에 쓰는 시프트 라벨 */
export function keyLabel(semi: number): string {
  return semi > 0 ? `+${semi}` : String(semi);
}
