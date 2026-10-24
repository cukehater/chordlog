import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControlBar } from '@/components/play/ControlBar';
import { usePlayView } from '@/lib/ui/playView';
import { MOCK_SONGS } from '@/lib/mock/songs';

function Harness() {
  const view = usePlayView({ tempo: MOCK_SONGS[0].tempo });
  return <ControlBar song={MOCK_SONGS[0]} view={view} />;
}

describe('ControlBar', () => {
  it('조작을 이조·오토스크롤·글자·메트로놈 그룹으로 묶는다', () => {
    render(<Harness />);
    for (const name of ['Transpose', 'Autoscroll', 'Font', 'Metronome']) {
      expect(screen.getByRole('group', { name })).toBeInTheDocument();
    }
  });

  it('키 스테퍼가 현재 키를 바꾼다', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    expect(screen.getByText('G#')).toBeInTheDocument();
  });

  it('이조하면 원키로 버튼이 나타나고 누르면 원키로 되돌린다', async () => {
    render(<Harness />);
    expect(screen.queryByRole('button', { name: '원키로' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    await userEvent.click(screen.getByRole('button', { name: '원키로' }));
    expect(screen.getByText('G')).toBeInTheDocument();
    expect(screen.getByText('원키')).toBeInTheDocument();
  });

  it('오토스크롤을 켜면 버튼이 멈춤으로 바뀐다', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: '오토스크롤' }));
    expect(screen.getByRole('button', { name: '멈춤' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('박자 점 4개를 그린다', () => {
    const { container } = render(<Harness />);
    expect(container.querySelectorAll('[data-beat-dot]')).toHaveLength(4);
  });

  it('집중 모드 버튼의 라벨이 상태에 따라 바뀐다', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: /집중 모드/ }));
    expect(screen.getByRole('button', { name: /집중 모드 끄기/ })).toBeInTheDocument();
  });

  it('음소거 버튼에 aria-label이 있다', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: '메트로놈 음소거' })).toBeInTheDocument();
  });
});
