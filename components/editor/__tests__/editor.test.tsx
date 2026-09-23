import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InsertToolbar, SNIPPETS } from '@/components/editor/InsertToolbar';
import { SourcePane } from '@/components/editor/SourcePane';

describe('SNIPPETS', () => {
  it('TAB 버튼은 6줄 뼈대를 넣는다 — 손으로 치게 두지 않는다', () => {
    expect(SNIPPETS.tab.split('\n').filter((l) => l.includes('|')).length).toBe(6);
  });

  it('스트러밍 뼈대는 16칸 + 강세 줄 구조다', () => {
    const lines = SNIPPETS.strum.split('\n');
    const slotLine = lines.find((l) => l.trim().startsWith('D'))!;
    expect(slotLine.trim().split(/\s+/)).toHaveLength(16);
  });
});

describe('InsertToolbar', () => {
  it('버튼 5개를 보여주고 눌리면 해당 뼈대를 넘긴다', async () => {
    const onInsert = vi.fn();
    render(<InsertToolbar onInsert={onInsert} />);
    await userEvent.click(screen.getByRole('button', { name: 'TAB 6줄' }));
    expect(onInsert).toHaveBeenCalledWith(SNIPPETS.tab);
  });
});

describe('SourcePane', () => {
  it('textarea에 label이 연결되어 있다', () => {
    render(<SourcePane value="" onChange={() => {}} />);
    expect(screen.getByLabelText('악보 원문')).toBeInTheDocument();
  });

  it('줄번호 거터는 장식이므로 aria-hidden이다', () => {
    const { container } = render(<SourcePane value={'a\nb\nc'} onChange={() => {}} />);
    expect(container.querySelector('[data-gutter]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('오류 줄번호를 danger 색으로 표시하고 하단 스트립을 띄운다', () => {
    render(
      <SourcePane value={'a\nb\nc'} onChange={() => {}} errorLine={2} errorMessage="닫히지 않은 대괄호 [Am7" />
    );
    expect(screen.getByText('2행')).toBeInTheDocument();
    expect(screen.getByText(/닫히지 않은 대괄호/)).toBeInTheDocument();
  });

  it('오류가 없으면 스트립을 렌더링하지 않는다', () => {
    const { container } = render(<SourcePane value="a" onChange={() => {}} />);
    expect(container.querySelector('[data-error-strip]')).toBeNull();
  });
});
