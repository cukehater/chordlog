import { render, screen } from '@testing-library/react';
import { SongHeader } from '@/components/song/SongHeader';
import { SongAside } from '@/components/song/SongAside';
import { MOCK_SONGS } from '@/lib/mock/songs';

const song = MOCK_SONGS[0]; // 원키 G, 카포 2프렛, 표준 튜닝

describe('SongHeader', () => {
  it('이조하면 원키와 현재 키를 함께 보여준다', () => {
    const { container } = render(<SongHeader song={song} semi={2} />);
    expect(container.querySelector('[data-original-key]')).toHaveTextContent('G');
    expect(container.querySelector('[data-current-key]')).toHaveTextContent('A');
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('원키 그대로면 현재 키를 따로 그리지 않는다', () => {
    const { container } = render(<SongHeader song={song} semi={0} />);
    expect(container.querySelector('[data-current-key]')).toBeNull();
  });

  it('제목은 h1, 템포·수정일을 보여준다', () => {
    render(<SongHeader song={song} semi={0} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(song.title);
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText(/3일 전 수정/)).toBeInTheDocument();
  });
});

describe('SongAside', () => {
  it('카포는 프렛 수와 설명 한 줄을 보여준다', () => {
    render(<SongAside song={song} semi={0} />);
    expect(screen.getByText('2프렛')).toBeInTheDocument();
    expect(screen.getByText(/카포를 끼우고/)).toBeInTheDocument();
  });

  it('연습 메모와 원본 영상 링크를 보여준다', () => {
    render(<SongAside song={song} semi={0} />);
    expect(screen.getByText('연습 메모')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /원본 영상/ })).toHaveAttribute('href', song.reference);
  });

  it('메모가 없는 곡에서는 메모 카드를 렌더링하지 않는다', () => {
    render(<SongAside song={MOCK_SONGS[1]} semi={0} />);
    expect(screen.queryByText('연습 메모')).toBeNull();
  });
});
