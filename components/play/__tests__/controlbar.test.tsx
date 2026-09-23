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
  it('두 단의 마이크로 라벨 KEY / PLAY를 보여준다', () => {
    render(<Harness />);
    expect(screen.getByText('KEY')).toBeInTheDocument();
    expect(screen.getByText('PLAY')).toBeInTheDocument();
  });

  it('키 스테퍼가 현재 키를 바꾼다', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    expect(screen.getByText('G#')).toBeInTheDocument();
  });

  it('RESET은 원키로 되돌린다', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    await userEvent.click(screen.getByRole('button', { name: 'RESET' }));
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('오토스크롤을 켜면 안내 문구가 바뀐다', async () => {
    render(<Harness />);
    expect(screen.getByText(/오토스크롤을 켜면 1단 보기로 전환됩니다/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /오토스크롤/ }));
    expect(screen.getByText(/1단으로 바뀌고 악보가 저절로 내려갑니다/)).toBeInTheDocument();
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
    expect(screen.getByRole('button', { name: '메트로놈 소리 켜고 끄기' })).toBeInTheDocument();
  });
});
