import { transposeChord, keyLabel } from '@/lib/chordpro/transpose';

describe('transposeChord', () => {
  it('올리는 방향은 샤프로 적는다', () => {
    expect(transposeChord('Am7', +2)).toBe('Bm7');
    expect(transposeChord('G/B', +2)).toBe('A/C#');
  });

  it('내리는 방향은 플랫으로 적는다', () => {
    expect(transposeChord('G/B', -2)).toBe('F/A');
    expect(transposeChord('A', -1)).toBe('Ab');
  });

  it('퀄리티·텐션 문자열은 그대로 보존한다', () => {
    expect(transposeChord('F#m7b5', +1)).toBe('Gm7b5');
    expect(transposeChord('Csus4', +2)).toBe('Dsus4');
  });

  it('0 시프트는 입력 그대로 돌려준다', () => {
    expect(transposeChord('Am7', 0)).toBe('Am7');
    expect(transposeChord('Bbm7', 0)).toBe('Bbm7');
    expect(transposeChord('C/Eb', 0)).toBe('C/Eb');
  });

  it('모르는 표기도 내용을 잃지 않는다', () => {
    expect(transposeChord('N.C.', +2)).toBe('N.C.');
    expect(transposeChord('', +2)).toBe('');
  });

  it('12키 전조가 모두 유효한 코드 토큰을 낸다', () => {
    const valid = /^[A-G](#|b)?[^/]*(\/[A-G](#|b)?)?$/;
    for (const chord of ['G', 'Am7', 'Csus4', 'F#m7b5', 'G/B']) {
      for (let semi = -11; semi <= 11; semi++) {
        expect(transposeChord(chord, semi)).toMatch(valid);
      }
    }
  });
});

describe('keyLabel', () => {
  it('양수에는 +를 붙인다', () => {
    expect(keyLabel(2)).toBe('+2');
    expect(keyLabel(0)).toBe('0');
    expect(keyLabel(-3)).toBe('-3');
  });
});
