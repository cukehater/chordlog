import { render, screen } from '@testing-library/react';
import LandingPage from '@/app/page';

// jsdom에는 matchMedia가 없다. reduced-motion 훅만 쓰므로 false로 둔다.
beforeAll(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

describe('/ 랜딩', () => {
  it('서비스 이름을 제목으로, CTA는 곡 목록으로 보낸다', () => {
    render(<LandingPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Chordlog' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /코드 둘러보기/ })).toHaveAttribute('href', '/songs');
  });
});
