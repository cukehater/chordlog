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

  it('집중 모드를 켜면 내비·곡 머리가 사라지고 툴바와 패턴 카드는 남는다', async () => {
    render(<SongDetailView song={song} initialSemi={0} />);
    expect(desktop().getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '화면 테마 전환' })).toBeInTheDocument();
    await userEvent.click(desktop().getByRole('button', { name: /집중 모드/ }));
    expect(desktop().queryByRole('heading', { level: 1 })).toBeNull();
    expect(screen.queryByRole('button', { name: '화면 테마 전환' })).toBeNull();
    expect(desktop().getByRole('group', { name: 'Transpose' })).toBeInTheDocument(); // 툴바 유지
    expect(desktop().getByText('패턴 A')).toBeInTheDocument();
  });

  it('스트러밍 패턴을 시트 밖에 A·B로 보여준다', () => {
    render(<SongDetailView song={song} initialSemi={0} />);
    expect(desktop().getByText('패턴 A')).toBeInTheDocument();
    expect(desktop().getByText('패턴 B')).toBeInTheDocument();
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

  // 회귀 테스트: usePlayView는 데스크톱·모바일 두 트리에 같은 sheetRef를 넘긴다.
  // jsdom은 미디어 쿼리를 평가하지 않아 둘 다 마운트되므로(위 desktop() 헬퍼 주석 참고),
  // 실제 브라우저의 `display:none`을 clientHeight/scrollHeight를 0으로 고정해 흉내 낸다.
  // 예전 단일 useRef 구현이면 마지막에 커밋되는(트리 순서상 모바일) 시트가 ref.current를
  // 덮어써, 데스크톱 뷰포트에서도 clientHeight=0인 숨은 시트를 굴리려다 첫 프레임에
  // `scrollTop(0) + clientHeight(0) >= scrollHeight(0) - 1`이 참이 되어 즉시 꺼진다.
  it('오토스크롤은 보이는(desktop) 시트만 움직이고, 숨은 모바일 시트에 속아 꺼지지 않는다', async () => {
    render(<SongDetailView song={song} initialSemi={0} />);

    const sheetEls = Array.from(document.querySelectorAll<HTMLDivElement>('[data-sheet]'));
    expect(sheetEls).toHaveLength(2); // 데스크톱 트리 + 모바일 트리, 각각의 Sheet

    const desktopRoot = document.querySelector('[data-desktop-view]') as HTMLElement;
    const desktopSheet = desktopRoot.querySelector('[data-sheet]') as HTMLDivElement;
    const mobileSheet = sheetEls.find((el) => el !== desktopSheet) as HTMLDivElement;
    expect(desktopSheet).not.toBeNull();
    expect(mobileSheet).not.toBeNull();

    // 데스크톱 시트는 실제로 보인다 — 스크롤할 여지가 있는 높이를 준다.
    // jsdom은 레이아웃이 없어 scrollTop이 clientHeight/scrollHeight 기반으로
    // 자체 클램핑을 시도해 값이 어긋난다 — 셋 다 순수 값 프로퍼티로 덮어써 실제
    // 브라우저의 "치수 고정 + 자유로운 scrollTop 누적"만 흉내 낸다.
    let desktopScrollTop = 0;
    Object.defineProperty(desktopSheet, 'clientHeight', { value: 400, configurable: true });
    Object.defineProperty(desktopSheet, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(desktopSheet, 'scrollTop', {
      configurable: true,
      get: () => desktopScrollTop,
      // 실제 브라우저는 scrollTop을 정수로 반올림한다. 프레임당 증가분이 1px 미만
      // (1.0× = 25px/s ÷ 60fps ≈ 0.42px)이라, 훅이 `el.scrollTop += dt*속도`처럼
      // 요소 값에 직접 누적하면 매 프레임 0으로 깎여 영영 움직이지 않는다.
      // 그 특성을 그대로 흉내 내 누적 실패를 잡는다.
      set: (v: number) => { desktopScrollTop = Math.round(v); },
    });
    // 모바일 시트는 `md:hidden`(display:none)이라 실제 브라우저에서는 치수가 0이다.
    Object.defineProperty(mobileSheet, 'clientHeight', { value: 0, configurable: true });
    Object.defineProperty(mobileSheet, 'scrollHeight', { value: 0, configurable: true });

    // jsdom의 requestAnimationFrame 타임스탬프는 performance.now()와 다른 시계를 써서
    // (실측: rAF ts ≈ 274ms vs performance.now() ≈ 1107ms), dt가 크게 어긋나 flaky해진다.
    // 훅이 쓰는 것과 같은 시계(performance.now())로 콜백을 쏴 주는 rAF로 바꿔 그 문제를 없앤다.
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 0) as unknown as number;
    });
    const cafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
    });

    try {
      await userEvent.click(desktop().getByRole('button', { name: '오토스크롤' }));
      expect(desktop().getByRole('button', { name: '멈춤' })).toBeInTheDocument();

      // 프레임 몇 개가 실제로 흘러가게 둔다.
      await new Promise((resolve) => setTimeout(resolve, 150));
      const first = desktopSheet.scrollTop;
      await new Promise((resolve) => setTimeout(resolve, 150));
      const second = desktopSheet.scrollTop;

      // 버그가 있었다면 첫 프레임에 즉시 꺼져 '오토스크롤' 라벨로 되돌아간다.
      expect(desktop().getByRole('button', { name: '멈춤' })).toBeInTheDocument();
      expect(first).toBeGreaterThan(0);
      // 요소의 scrollTop에 직접 누적하면 정수 반올림에 매 프레임 깎여 한 자리에
      // 멈춘다. 계속 "자라는지"를 봐야 그 구현과 구분된다.
      expect(second).toBeGreaterThan(first);
      expect(mobileSheet.scrollTop).toBe(0); // 숨은 쪽은 건드리지 않는다
    } finally {
      rafSpy.mockRestore();
      cafSpy.mockRestore();
    }
  });
});
