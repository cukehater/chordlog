import { render, screen } from '@testing-library/react';
import { Fretboard, capoBarX, capoBarRight, type FretboardSize } from '@/components/song/Fretboard';
import { TuningTokens } from '@/components/song/TuningTokens';

const BOARD_WIDTH: Record<FretboardSize, number> = { rail: 254, hero: 92, editor: 200, bar: 44, row: 34 };

describe('Fretboard', () => {
  it('레일 크기 2프렛 카포는 아트보드 실측값 x=94에 놓인다', () => {
    expect(capoBarX('rail', 2)).toBe(94);
  });

  it('에디터 크기 2프렛 카포는 아트보드 실측값 x=73에 놓인다', () => {
    expect(capoBarX('editor', 2)).toBe(73);
  });

  it('0프렛이면 카포 바를 그리지 않는다', () => {
    expect(capoBarX('rail', 0)).toBeNull();
    const { container } = render(<Fretboard fret={0} size="rail" />);
    expect(container.querySelector('[data-capo-bar]')).toBeNull();
  });

  it('장식용 SVG는 aria-hidden이다', () => {
    const { container } = render(<Fretboard fret={2} size="bar" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(Object.keys(BOARD_WIDTH) as FretboardSize[])(
    '7프렛 카포 바가 %s 보드 밖으로 나가지 않는다',
    (size) => {
      const right = capoBarRight(size, 7);
      expect(right).not.toBeNull();
      expect(right as number).toBeLessThanOrEqual(BOARD_WIDTH[size]);
    },
  );

  it('7프렛 카포를 렌더링하면 카포 바와 프렛 번호 7이 보인다', () => {
    const { container } = render(<Fretboard fret={7} size="rail" />);
    expect(container.querySelector('[data-capo-bar]')).not.toBeNull();
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});

describe('TuningTokens', () => {
  it('표준 튜닝은 모든 줄을 기본 색으로 둔다', () => {
    const { container } = render(<TuningTokens tuning="E A D G B E" />);
    expect(container.querySelectorAll('[data-changed="true"]')).toHaveLength(0);
  });

  it('Drop D는 바뀐 줄만 앰버로 표시한다', () => {
    const { container } = render(<TuningTokens tuning="D A D G B E" />);
    const changed = container.querySelectorAll('[data-changed="true"]');
    expect(changed).toHaveLength(1);
    expect(changed[0].textContent).toBe('D');
  });

  it('줄번호를 켜면 6→1 순으로 붙는다', () => {
    const { container } = render(<TuningTokens tuning="E A D G B E" showStringNumbers />);
    const numbers = Array.from(container.querySelectorAll('[data-string-number]')).map((el) => el.textContent);
    expect(numbers).toEqual(['6', '5', '4', '3', '2', '1']);
  });
});
