import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileDock } from '@/components/play/MobileDock';
import { usePlayView } from '@/lib/ui/playView';
import { MOCK_SONGS } from '@/lib/mock/songs';

function Harness() {
  const view = usePlayView({ tempo: MOCK_SONGS[0].tempo });
  return <MobileDock song={MOCK_SONGS[0]} view={view} />;
}

describe('MobileDock', () => {
  it('모든 독 버튼이 44px 이상 높이를 유지한다', () => {
    render(<Harness />);
    for (const name of ['오토스크롤 켜고 끄기', '메트로놈 켜고 끄기', '키 반음 내리기', '키 반음 올리기', '글자 작게', '글자 크게']) {
      const btn = screen.getByRole('button', { name });
      expect(btn.className).toMatch(/h-\[4[4-9]px\]|h-11/);
    }
  });

  it('메트로놈이 켜지면 버튼이 박자 숫자를 보여준다', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: '메트로놈 켜고 끄기' }));
    expect(screen.getByRole('button', { name: '메트로놈 켜고 끄기' }).textContent).toBe('1');
  });

  it('현재 키와 시프트를 함께 보여준다', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    expect(screen.getByText('G#')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
