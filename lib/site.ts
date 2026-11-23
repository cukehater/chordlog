/**
 * 서비스 이름과 랜딩 문구를 한곳에 둔다.
 * "Chordlog"는 가칭이라 이름을 바꿀 때 이 파일만 고치면 된다.
 */
export const siteConfig = {
  name: 'Chordlog',
  /** 워드마크·랜딩 타이틀에서 이탤릭·액센트로 강조할 끝부분. name이 이 문자열로 끝나지 않으면 강조하지 않는다. */
  nameAccent: 'log',
  tagline: '기타 코드 악보를 글처럼 쓰고, 블로그처럼 모으세요.',
  cta: { label: '코드 둘러보기', href: '/songs' },
} as const;

/** name을 [앞부분, 강조 끝부분]으로 나눈다. */
export function splitName(name: string = siteConfig.name, accent: string = siteConfig.nameAccent): [string, string] {
  if (!accent || !name.endsWith(accent) || name === accent) return [name, ''];
  return [name.slice(0, -accent.length), accent];
}
