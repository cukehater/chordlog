import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SongDetailView } from '@/components/play/SongDetailView';
import { MOCK_SONGS } from '@/lib/mock/songs';

const song = MOCK_SONGS[0];

// jsdom은 미디어 쿼리를 평가하지 않아 데스크톱·모바일 트리가 둘 다 렌더링된다.
// 데스크톱 전용 마크업을 가리키려면 `data-desktop-view`로 범위를 좁힌다.
function desktop() {
  const el = document.querySelector('[data-desktop-view]');
  expect(el).not.toBeNull(); // 선택자가 실제로 데스크톱 트리를 잡는지 확인
  return within(el as HTMLElement);
}

describe('SongDetailView', () => {
  it('URL에서 받은 키 시프트로 시작한다', () => {
    const { container } = render(<SongDetailView song={song} initialSemi={2} />);
    expect(container.querySelector('[data-current-key]')?.textContent).toBe('A'); // G +2
  });

  it('집중 모드를 켜면 헤더·좌측 레일이 사라지고 컨트롤 바는 남는다', async () => {
    render(<SongDetailView song={song} initialSemi={0} />);
    expect(screen.getByText('PRACTICE NOTE')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '화면 테마 전환' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /집중 모드/ }));
    expect(screen.queryByText('PRACTICE NOTE')).toBeNull();
    expect(screen.queryByRole('button', { name: '화면 테마 전환' })).toBeNull();
    expect(screen.getByText('PLAY')).toBeInTheDocument(); // 컨트롤 바는 유지
  });

  it('스트러밍 패턴을 시트 밖에 A·B로 보여준다', () => {
    render(<SongDetailView song={song} initialSemi={0} />);
    expect(desktop().getByText('PATTERN A')).toBeInTheDocument();
    expect(desktop().getByText('PATTERN B')).toBeInTheDocument();
  });

  it('키를 바꾸면 악보 코드도 함께 이조된다', async () => {
    render(<SongDetailView song={song} initialSemi={0} />);
    expect(desktop().getAllByText('Am7').length).toBeGreaterThan(0);
    await userEvent.click(desktop().getByRole('button', { name: '키 반음 올리기' }));
    expect(desktop().getAllByText('A#m7').length).toBeGreaterThan(0);
  });

  it('TAB은 키를 바꿔도 그대로다', async () => {
    render(<SongDetailView song={song} initialSemi={0} />);
    const before = desktop().getAllByText(/13-11/)[0].textContent;
    await userEvent.click(desktop().getByRole('button', { name: '키 반음 올리기' }));
    expect(desktop().getAllByText(/13-11/)[0].textContent).toBe(before);
  });

  it('URL 힌트 줄에 현재 키 상태를 보여준다', async () => {
    render(<SongDetailView song={song} initialSemi={0} />);
    await userEvent.click(desktop().getByRole('button', { name: '키 반음 올리기' }));
    expect(desktop().getByText(new RegExp(`/songs/${song.slug}\\?key=\\+1`))).toBeInTheDocument();
  });
});
