import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetaForm } from '@/components/editor/MetaForm';
import { MOCK_SONGS } from '@/lib/mock/songs';

describe('MetaForm', () => {
  it('모든 입력에 label이 연결되어 있다', () => {
    render(<MetaForm song={MOCK_SONGS[0]} />);
    for (const label of ['TITLE *', 'ARTIST', 'KEY', 'TEMPO', 'STATUS', 'REFERENCE', 'TUNING', 'TAGS']) {
      expect(screen.getByLabelText(new RegExp(label.replace(' *', '')))).toBeInTheDocument();
    }
  });

  it('제목 입력은 Hahmlet을 쓴다', () => {
    render(<MetaForm song={MOCK_SONGS[0]} />);
    expect(screen.getByLabelText(/TITLE/).className).toContain('font-display');
  });

  it('TEMPO 입력은 mono를 쓴다', () => {
    render(<MetaForm song={MOCK_SONGS[0]} />);
    expect(screen.getByLabelText(/TEMPO/).className).toContain('font-mono');
  });

  it('카포 카드는 코드가 바뀌지 않는다는 설명을 단다', () => {
    render(<MetaForm song={MOCK_SONGS[0]} />);
    expect(screen.getByText(/악보 코드는 바뀌지 않아요/)).toBeInTheDocument();
  });

  it('새 곡일 때는 빈 폼을 보여준다', () => {
    render(<MetaForm />);
    expect((screen.getByLabelText(/TITLE/) as HTMLInputElement).value).toBe('');
  });

  it("튜닝 프리셋에서 '직접 입력'을 고르면 텍스트 입력이 나타난다", async () => {
    render(<MetaForm song={MOCK_SONGS[0]} />);
    expect(screen.queryByPlaceholderText('E A D G B E')).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('TUNING'), '직접 입력');
    expect(screen.getByPlaceholderText('E A D G B E')).toBeInTheDocument();
  });

  it('직접 입력한 튜닝 값이 TuningTokens 표시에 즉시 반영된다', async () => {
    const { container } = render(<MetaForm song={MOCK_SONGS[0]} />);
    await userEvent.selectOptions(screen.getByLabelText('TUNING'), '직접 입력');
    const customInput = screen.getByPlaceholderText('E A D G B E');
    await userEvent.clear(customInput);
    await userEvent.type(customInput, 'D A D G B E');
    const changed = container.querySelectorAll('[data-changed="true"]');
    expect(changed).toHaveLength(1);
  });
});
