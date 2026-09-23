import { render, screen } from '@testing-library/react';
import { InfoRail } from '@/components/song/InfoRail';
import { MOCK_SONGS } from '@/lib/mock/songs';

const song = MOCK_SONGS[0]; // 원키 G, 카포 2프렛, 표준 튜닝

describe('InfoRail', () => {
  it('원키와 현재 키를 함께 보여준다', () => {
    const { container } = render(<InfoRail song={song} semi={2} />);
    expect(container.querySelector('[data-original-key]')).toHaveTextContent('G');   // 원키
    expect(container.querySelector('[data-current-key]')).toHaveTextContent('A');    // 현재 키 (G +2)
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('카포는 프렛 수와 설명 한 줄을 보여준다', () => {
    render(<InfoRail song={song} semi={0} />);
    expect(screen.getByText('2프렛')).toBeInTheDocument();
    expect(screen.getByText(/카포를 끼우고/)).toBeInTheDocument();
  });

  it('TEMPO와 UPDATED를 보여준다', () => {
    render(<InfoRail song={song} semi={0} />);
    expect(screen.getByText('72 BPM')).toBeInTheDocument();
    expect(screen.getByText('3일 전')).toBeInTheDocument();
  });

  it('PRACTICE NOTE와 원본 영상 링크를 하단에 둔다', () => {
    render(<InfoRail song={song} semi={0} />);
    expect(screen.getByText('PRACTICE NOTE')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /원본 영상/ })).toHaveAttribute('href', song.reference);
  });

  it('메모가 없는 곡에서는 노트 영역을 렌더링하지 않는다', () => {
    render(<InfoRail song={MOCK_SONGS[1]} semi={0} />);
    expect(screen.queryByText('PRACTICE NOTE')).toBeNull();
  });
});
