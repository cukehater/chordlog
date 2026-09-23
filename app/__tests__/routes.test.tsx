import { render, screen } from '@testing-library/react';
import TagPage from '@/app/tags/[name]/page';

describe('/tags/[name]', () => {
  it('해당 태그가 달린 곡만 보여준다', async () => {
    const ui = await TagPage({ params: Promise.resolve({ name: encodeURIComponent('발라드') }) });
    render(ui);
    expect(screen.getByRole('link', { name: /우산 없이/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /여름이 길었다/ })).toBeNull();
  });

  it('태그 이름을 제목으로 보여준다', async () => {
    const ui = await TagPage({ params: Promise.resolve({ name: encodeURIComponent('포크') }) });
    render(ui);
    expect(screen.getByRole('heading', { name: /포크/ })).toBeInTheDocument();
  });
});
