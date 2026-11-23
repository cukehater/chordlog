import { render, screen } from '@testing-library/react';
import { SiteHeader } from '@/components/chrome/SiteHeader';

describe('SiteHeader', () => {
  it('워드마크는 목록으로 가는 링크다', () => {
    render(<SiteHeader variant="list" />);
    expect(screen.getByRole('link', { name: /Chordlog/ })).toHaveAttribute('href', '/songs');
  });

  it('아이콘 전용 버튼에 aria-label이 있다', () => {
    render(<SiteHeader variant="list" />);
    expect(screen.getByRole('button', { name: '화면 테마 전환' })).toBeInTheDocument();
  });

  it('detail 변형은 곡 제목을 브레드크럼으로 보여준다', () => {
    render(<SiteHeader variant="detail" crumb="새벽 두 시의 골목" />);
    expect(screen.getByText('새벽 두 시의 골목')).toBeInTheDocument();
  });
});
