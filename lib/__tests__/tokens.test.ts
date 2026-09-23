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
  '--color-accent-ink', '--color-accent-mute', '--color-done',
  '--color-archived', '--color-danger', '--color-danger-text', '--color-danger-ink',
  '--font-display', '--font-sans', '--font-mono',
];

describe('디자인 토큰', () => {
  it.each(REQUIRED)('%s 토큰이 정의되어 있다', (name) => {
    expect(css).toContain(`${name}:`);
  });

  it('액센트는 하나뿐이다 — 정본 hex 그대로', () => {
    expect(css).toContain('--color-accent:      #FF9D4D;');
  });

  it('악보 원자 규칙이 있다', () => {
    expect(css).toContain('.gc-pair');
    expect(css).toContain('.gc-line');
  });
});
