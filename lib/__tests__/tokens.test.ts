import { readFileSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, '../../app/globals.css'), 'utf8');

const REQUIRED = [
  '--color-bg', '--color-surface', '--color-surface-2', '--color-surface-3',
  '--color-sunk', '--color-control', '--color-line', '--color-line-soft',
  '--color-line-hair', '--color-line-strong', '--color-line-grid',
  '--color-line-header', '--color-line-chip', '--color-ink', '--color-ink-2',
  '--color-ink-3', '--color-ink-4', '--color-ink-5', '--color-dim',
  '--color-faint', '--color-lyric', '--color-tab', '--color-accent',
  '--color-accent-hover', '--color-accent-ink', '--color-accent-mute', '--color-done',
  '--color-archived', '--color-danger', '--color-danger-text', '--color-danger-ink',
  '--font-display', '--font-sans', '--font-mono',
];

function token(name: string) {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9A-Fa-f]{6});`));
  if (!m) throw new Error(`--color-${name} 없음`);
  return m[1];
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('디자인 토큰', () => {
  it.each(REQUIRED)('%s 토큰이 정의되어 있다', (name) => {
    expect(css).toContain(`${name}:`);
  });

  it('액센트는 하나뿐이다 — 정본 hex 그대로', () => {
    expect(css).toContain('--color-accent:       #F0A04B;');
  });

  // 읽어야 하는 글자는 어두운 바탕(bg, surface-2) 위에서 WCAG AA 4.5:1 이상
  it.each([
    'ink', 'ink-2', 'ink-3', 'ink-4', 'ink-5', 'dim', 'lyric', 'tab', 'accent', 'done', 'danger-text',
  ])('--color-%s 대비가 4.5:1 이상이다', (name) => {
    for (const back of ['bg', 'surface-2']) {
      expect(contrast(token(name), token(back))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('액센트 위 글자(accent-ink)도 4.5:1 이상이다', () => {
    expect(contrast(token('accent-ink'), token('accent'))).toBeGreaterThanOrEqual(4.5);
  });

  it('악보 원자 규칙이 있다', () => {
    expect(css).toContain('.gc-pair');
    expect(css).toContain('.gc-line');
  });
});
