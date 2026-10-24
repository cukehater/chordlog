import { render, screen } from '@testing-library/react';
import { StrumGrid, patternName } from '@/components/sheet/StrumGrid';
import type { Slot } from '@/lib/types';

function slots(spec: string, accents: number[]): Slot[] {
  return Array.from({ length: 16 }, (_, i) => ({
    stroke: spec[i] === 'D' ? 'D' : spec[i] === 'U' ? 'U' : null,
    accent: accents.includes(i),
  }));
}

describe('StrumGrid', () => {
  it('칸을 정확히 16개 그린다', () => {
    const { container } = render(
      <StrumGrid name="PATTERN A" use="Verse" slots={slots('D-D-DUD-D-D-DU--', [4, 12])} />
    );
    expect(container.querySelectorAll('[data-slot]')).toHaveLength(16);
  });

  it('박 칸 라벨은 1 2 3 4다', () => {
    render(<StrumGrid name="PATTERN A" use="Verse" slots={slots('D---D---D---D---', [])} />);
    for (const n of ['1', '2', '3', '4']) {
      expect(screen.getAllByText(n).length).toBeGreaterThan(0);
    }
  });

  it('다운은 ↓, 업은 ↑, 쉼은 ·로 표시한다 — 입력은 D/U/-다', () => {
    const { container } = render(
      <StrumGrid name="PATTERN A" use="Verse" slots={slots('DU--------------', [])} />
    );
    const cells = container.querySelectorAll('[data-slot]');
    expect(cells[0].textContent).toContain('↓');
    expect(cells[1].textContent).toContain('↑');
    expect(cells[2].textContent).toContain('·');
  });

  it('강세 칸에는 앰버 하단 바를 붙인다', () => {
    const { container } = render(
      <StrumGrid name="PATTERN A" use="Verse" slots={slots('D-D-D-D-D-D-D-D-', [4])} />
    );
    const bars = container.querySelectorAll('[data-accent-bar="true"]');
    expect(bars).toHaveLength(1);
  });

  it('첫 칸을 뺀 박 칸에 좌측 구분선을 넣는다', () => {
    const { container } = render(
      <StrumGrid name="PATTERN A" use="Verse" slots={slots('D---D---D---D---', [])} />
    );
    expect(container.querySelectorAll('[data-beat-divider="true"]')).toHaveLength(3);
  });
});

describe('patternName', () => {
  it('순서대로 A, B를 붙인다', () => {
    expect(patternName(0)).toBe('패턴 A');
    expect(patternName(1)).toBe('패턴 B');
  });
});
