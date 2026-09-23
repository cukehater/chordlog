import { MOCK_SONGS, getSong } from '@/lib/mock/songs';

describe('목 곡 데이터', () => {
  it('스트러밍 블록은 슬롯이 정확히 16개다', () => {
    for (const song of MOCK_SONGS) {
      for (const b of song.blocks) {
        if (b.k === 'strum') expect(b.slots).toHaveLength(16);
      }
    }
  });

  it('TAB 블록은 정확히 6줄이다', () => {
    for (const song of MOCK_SONGS) {
      for (const b of song.blocks) {
        if (b.k === 'tab') expect(b.lines).toHaveLength(6);
      }
    }
  });

  it('hasTab 플래그가 실제 TAB 블록 유무와 일치한다', () => {
    for (const song of MOCK_SONGS) {
      expect(song.hasTab).toBe(song.blocks.some((b) => b.k === 'tab'));
    }
  });

  it('slug는 중복되지 않는다', () => {
    const slugs = MOCK_SONGS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('slug로 곡을 찾는다', () => {
    expect(getSong(MOCK_SONGS[0].slug)?.title).toBe(MOCK_SONGS[0].title);
    expect(getSong('없는-곡')).toBeUndefined();
  });
});
