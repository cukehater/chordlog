import { render, screen } from '@testing-library/react';
import { Sheet, sheetBlocks, strumBlocks } from '@/components/sheet/Sheet';
import { ChordLine } from '@/components/sheet/ChordLine';
import { TabBlock } from '@/components/sheet/TabBlock';
import type { Block } from '@/lib/types';

const BLOCKS: Block[] = [
  { k: 'strum', use: 'Verse', slots: Array.from({ length: 16 }, () => ({ stroke: null, accent: false })) },
  { k: 'label', label: 'Verse 1' },
  { k: 'line', pairs: [{ chord: 'G', text: '가로등 하나 ' }, { chord: 'Em', text: '꺼지고' }] },
  { k: 'comment', text: '손목 힘 빼고' },
  { k: 'tab', title: '메인 리프', repeat: '×3', lines: ['--10--', '------', '------', '------', '------', '------'] },
];

describe('sheetBlocks', () => {
  it('strum 블록은 시트에서 빼고 따로 넘긴다', () => {
    expect(sheetBlocks(BLOCKS).some((b) => b.k === 'strum')).toBe(false);
    expect(strumBlocks(BLOCKS)).toHaveLength(1);
  });
});

describe('ChordLine', () => {
  it('가사 조각 끝의 공백을 보존한다 — 그 공백이 코드 간격을 만든다', () => {
    const { container } = render(
      <ChordLine semi={0} pairs={[{ chord: 'G', text: '가로등 하나 ' }]} />
    );
    expect(container.querySelector('.lyric')!.textContent).toBe('가로등 하나 ');
  });

  it('semi만큼 이조해서 코드를 보여준다', () => {
    render(<ChordLine semi={2} pairs={[{ chord: 'Am7', text: '우린' }]} />);
    expect(screen.getByText('Bm7')).toBeInTheDocument();
  });

  it('코드가 없는 조각도 높이를 차지해 줄이 흔들리지 않는다', () => {
    const { container } = render(<ChordLine semi={0} pairs={[{ chord: null, text: '가사만' }]} />);
    expect(container.querySelector('.chord')).toBeInTheDocument();
  });

  it('오류 줄에는 danger 좌측 바를 붙인다', () => {
    const { container } = render(<ChordLine semi={0} hasError pairs={[{ chord: null, text: '깨진 줄' }]} />);
    expect(container.firstElementChild!.className).toContain('border-danger');
  });
});

describe('TabBlock', () => {
  it('6줄을 줄 이름과 함께 그대로 보존한다', () => {
    const { container } = render(<TabBlock title="메인 리프" repeat="×3" lines={['--10--', '-', '-', '-', '-', '-']} />);
    const rows = container.querySelectorAll('[data-tab-row]');
    expect(rows).toHaveLength(6);
    expect(rows[0].textContent).toContain('--10--');
    expect(screen.getByText('×3')).toBeInTheDocument();
  });

  it('TAB은 이조하지 않는다 — semi를 받지 않는다', () => {
    render(<Sheet blocks={BLOCKS} semi={5} fontSize={18} cols={2} />);
    expect(screen.getByText(/--10--/)).toBeInTheDocument();
  });
});

describe('Sheet errorLines', () => {
  it('errorLines는 line 블록만 세어 두 번째 line 블록에 표시한다 — 사이에 낀 label/comment/tab은 세지 않는다', () => {
    const blocks: Block[] = [
      { k: 'label', label: 'Verse 1' },
      { k: 'line', pairs: [{ chord: 'G', text: '첫줄' }] },
      { k: 'comment', text: '주석' },
      { k: 'tab', title: '리프', repeat: '', lines: ['-', '-', '-', '-', '-', '-'] },
      { k: 'line', pairs: [{ chord: 'Em', text: '둘째줄' }] },
    ];
    const { container } = render(
      <Sheet blocks={blocks} errorLines={[1]} semi={0} fontSize={18} cols={1} />
    );
    const lines = container.querySelectorAll('.gc-line');
    expect(lines).toHaveLength(2);
    expect(lines[0].className).not.toContain('border-danger');
    expect(lines[1].className).toContain('border-danger');
  });
});
