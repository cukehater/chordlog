import { render, screen, within } from '@testing-library/react';
import { TrackList } from '@/components/song/TrackList';
import { ContinueCard } from '@/components/song/ContinueCard';
import { MOCK_SONGS } from '@/lib/mock/songs';

describe('TrackList', () => {
  it('행 전체가 곡 상세로 가는 링크다', () => {
    render(<TrackList songs={MOCK_SONGS} />);
    const first = screen.getByRole('link', { name: /새벽 두 시의 골목/ });
    expect(first).toHaveAttribute('href', '/songs/saebyeok-du-siui-golmok');
  });

  it('TAB이 있는 곡에 TAB 배지를 붙인다', () => {
    render(<TrackList songs={MOCK_SONGS} />);
    const row = screen.getByRole('link', { name: /새벽 두 시의 골목/ });
    expect(within(row).getByText('TAB')).toBeInTheDocument();
  });

  it('비표준 튜닝 곡에 DROP D 배지를 붙인다', () => {
    render(<TrackList songs={MOCK_SONGS} />);
    const row = screen.getByRole('link', { name: /겨울 정류장/ });
    expect(within(row).getByText('DROP D')).toBeInTheDocument();
  });

  it('카포 0은 —로 표시한다', () => {
    render(<TrackList songs={MOCK_SONGS} />);
    const row = screen.getByRole('link', { name: /늦은 편지/ });
    expect(within(row).getByText('—')).toBeInTheDocument();
  });

  it('번호는 2자리로 채운다', () => {
    render(<TrackList songs={MOCK_SONGS} />);
    // 데스크톱 행 + 모바일 행이 같은 <a> 안에서 둘 다 렌더링되므로 '01' 텍스트 노드가 2개 존재한다.
    // 검증 의도(2자리 패딩)는 그대로 두고 다중 매칭만 허용한다.
    expect(screen.getAllByText('01').length).toBeGreaterThan(0);
  });
});

describe('ContinueCard', () => {
  it('done 상태인 곡은 완성으로 표시한다 (보관이 아니다)', () => {
    const doneSong = MOCK_SONGS.find((s) => s.status === 'done')!;
    render(<ContinueCard song={doneSong} />);
    expect(screen.getByText(/완성/)).toBeInTheDocument();
    expect(screen.queryByText(/보관/)).not.toBeInTheDocument();
  });
});
