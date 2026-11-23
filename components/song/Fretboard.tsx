export type FretboardSize = 'rail' | 'hero' | 'bar' | 'row' | 'editor';

type Geo = {
  w: number; h: number;
  nutX: number; nutY: number; nutW: number; nutH: number;
  firstFret: number; spacing: number; fretTop: number; fretBottom: number;
  stringX: number; stringTop: number; stringGap: number; stringCount: number; stringWidth: number;
  barW: number; barGap: number; barY: number; barH: number;
  showNumbers: boolean;
};

// 값 출처: 시안 rail·hero·컨트롤 바 칩(bar)·모바일 연주 row·편집기 editor
const GEO: Record<FretboardSize, Geo> = {
  rail:   { w: 254, h: 46, nutX: 6, nutY: 6, nutW: 5, nutH: 34, firstFret: 58, spacing: 52, fretTop: 6, fretBottom: 40, stringX: 11, stringTop: 9.5, stringGap: 6.8, stringCount: 5, stringWidth: 1.1, barW: 10, barGap: 6, barY: 2, barH: 42, showNumbers: true },
  hero:   { w: 92,  h: 30, nutX: 3, nutY: 2, nutW: 4, nutH: 26, firstFret: 26, spacing: 20, fretTop: 2, fretBottom: 28, stringX: 7,  stringTop: 5,   stringGap: 5,   stringCount: 5, stringWidth: 1,   barW: 7,  barGap: 4, barY: 0, barH: 30, showNumbers: false },
  editor: { w: 200, h: 38, nutX: 4, nutY: 4, nutW: 4, nutH: 30, firstFret: 46, spacing: 42, fretTop: 4, fretBottom: 34, stringX: 8,  stringTop: 7,   stringGap: 6,   stringCount: 5, stringWidth: 1,   barW: 9,  barGap: 6, barY: 1, barH: 36, showNumbers: false },
  bar:    { w: 44,  h: 18, nutX: 2, nutY: 2, nutW: 3, nutH: 14, firstFret: 14, spacing: 12, fretTop: 2, fretBottom: 16, stringX: 5,  stringTop: 4,   stringGap: 3.5, stringCount: 4, stringWidth: 0.8, barW: 5,  barGap: 1, barY: 0, barH: 18, showNumbers: false },
  row:    { w: 34,  h: 16, nutX: 1, nutY: 2, nutW: 2.6, nutH: 12, firstFret: 12, spacing: 10, fretTop: 2, fretBottom: 14, stringX: 4, stringTop: 4,  stringGap: 3,   stringCount: 4, stringWidth: 0.8, barW: 4,  barGap: 1, barY: 0, barH: 16, showNumbers: false },
};

const FRET_MIN = 4; // 아트보드 기준 프렛선 개수
const FRET_MAX = 7; // 스펙상 카포 최대 프렛

/** 프렛 수에 따른 프렛선 기하. 4프렛 이하는 GEO 실측값 그대로,
 *  5프렛 이상은 같은 스팬(너트 끝 ~ 마지막 프렛선)에 프렛을 더 촘촘히 넣는다. */
function fretGeometry(g: Geo, fret: number) {
  const count = Math.max(FRET_MIN, Math.min(FRET_MAX, fret));
  if (count === FRET_MIN) return { count, firstFret: g.firstFret, spacing: g.spacing };
  const nutEnd = g.nutX + g.nutW;
  // 마지막 프렛선은 GEO의 4번째 선 위치를 쓰되, 카포 바가 보드 안에 들어오는 한계를 넘지 않는다.
  // (bar/row 칩은 GEO의 4번째 선 자체가 viewBox 밖이라 이 클램프가 필요하다)
  const lastLine = Math.min(g.firstFret + g.spacing * (FRET_MIN - 1), g.w - g.barW - g.barGap);
  const spacing = (lastLine - nutEnd) / count;
  return { count, firstFret: nutEnd + spacing, spacing };
}

/** 카포 바의 왼쪽 x. 바의 오른쪽 끝이 N번 프렛선에서 barGap만큼 왼쪽에 온다. */
export function capoBarX(size: FretboardSize, fret: number): number | null {
  if (fret <= 0) return null;
  const g = GEO[size];
  const { firstFret, spacing } = fretGeometry(g, fret);
  const fretLine = firstFret + spacing * (fret - 1);
  return fretLine - g.barW - g.barGap;
}

/** 카포 바의 오른쪽 x(= capoBarX + barW). 보드 폭(GEO[size].w) 안에 들어오는지 테스트용. */
export function capoBarRight(size: FretboardSize, fret: number): number | null {
  const x = capoBarX(size, fret);
  return x === null ? null : x + GEO[size].barW;
}

export function Fretboard({ fret, size }: { fret: number; size: FretboardSize }) {
  const g = GEO[size];
  const { count: fretCount, firstFret, spacing } = fretGeometry(g, fret);
  const barX = capoBarX(size, fret);
  const stringRight = g.w - g.nutX - 2;

  return (
    <svg width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} fill="none" aria-hidden="true">
      <rect x={g.nutX} y={g.nutY} width={g.nutW} height={g.nutH} rx={g.nutW / 2} fill="var(--color-fret-nut)" />
      {Array.from({ length: fretCount }, (_, i) => {
        const x = firstFret + spacing * i;
        return <path key={i} d={`M${x} ${g.fretTop}v${g.fretBottom - g.fretTop}`} stroke="var(--color-line-strong)" strokeWidth={size === 'rail' ? 1.6 : 1} />;
      })}
      {Array.from({ length: g.stringCount }, (_, i) => {
        const y = g.stringTop + g.stringGap * i;
        return <path key={i} d={`M${g.stringX} ${y}h${stringRight}`} stroke="var(--color-fret-string)" strokeWidth={g.stringWidth} />;
      })}
      {barX !== null ? (
        <rect data-capo-bar x={barX} y={g.barY} width={g.barW} height={g.barH} rx={g.barW / 2} fill="var(--color-accent)" />
      ) : null}
      {g.showNumbers
        ? Array.from({ length: fretCount }, (_, i) => {
            const n = i + 1;
            const cx = firstFret + spacing * i - spacing / 2;
            const on = n === fret;
            return (
              <text key={n} x={cx} y={g.h} fontSize={9} fontWeight={on ? 700 : 400}
                fill={on ? 'var(--color-ink)' : 'var(--color-dim)'}
                fontFamily="var(--font-mono)">{n}</text>
            );
          })
        : null}
    </svg>
  );
}
