import { act, renderHook } from '@testing-library/react';
import { usePlayView, SPEEDS } from '@/lib/ui/playView';

const setup = () => renderHook(() => usePlayView({ tempo: 72 }));

describe('키 시프트', () => {
  it('−11~+11에서 멈춘다', () => {
    const { result } = setup();
    act(() => { for (let i = 0; i < 15; i++) result.current.keyUp(); });
    expect(result.current.semi).toBe(11);
    act(() => { for (let i = 0; i < 30; i++) result.current.keyDown(); });
    expect(result.current.semi).toBe(-11);
  });

  it('RESET은 원키로 돌린다', () => {
    const { result } = setup();
    act(() => { result.current.keyUp(); result.current.keyReset(); });
    expect(result.current.semi).toBe(0);
  });
});

describe('글자 크기', () => {
  it('13~30px에서 멈춘다', () => {
    const { result } = setup();
    act(() => { for (let i = 0; i < 40; i++) result.current.fontUp(); });
    expect(result.current.fontSize).toBe(30);
    act(() => { for (let i = 0; i < 40; i++) result.current.fontDown(); });
    expect(result.current.fontSize).toBe(13);
  });
});

describe('오토스크롤과 단수', () => {
  it('오토스크롤을 켜면 1단으로 강제 전환한다', () => {
    const { result } = setup();
    expect(result.current.cols).toBe(2);
    act(() => result.current.toggleScroll());
    expect(result.current.scrolling).toBe(true);
    expect(result.current.cols).toBe(1);
  });

  it('2단 버튼을 누르면 스크롤이 멈춘다', () => {
    const { result } = setup();
    act(() => result.current.toggleScroll());
    act(() => result.current.setCols(2));
    expect(result.current.scrolling).toBe(false);
    expect(result.current.cols).toBe(2);
  });

  it('속도는 배속과 px/s를 함께 보여준다 — 1.0× = 25px/s', () => {
    const { result } = setup();
    act(() => { while (SPEEDS[result.current.speedIdx] !== 1) result.current.speedDown(); });
    expect(result.current.speedLabel).toBe('1×');
    expect(result.current.speedPx).toBe('25 PX/S');
  });

  it('속도는 0.5×~3.0× 8단계에서 멈춘다', () => {
    const { result } = setup();
    act(() => { for (let i = 0; i < 20; i++) result.current.speedUp(); });
    expect(SPEEDS[result.current.speedIdx]).toBe(3);
    act(() => { for (let i = 0; i < 20; i++) result.current.speedDown(); });
    expect(SPEEDS[result.current.speedIdx]).toBe(0.5);
  });
});

describe('메트로놈', () => {
  it('곡의 tempo로 시작한다', () => {
    const { result } = setup();
    expect(result.current.bpm).toBe(72);
  });

  it('40~240 BPM에서 멈춘다', () => {
    const { result } = setup();
    act(() => { for (let i = 0; i < 300; i++) result.current.bpmUp(); });
    expect(result.current.bpm).toBe(240);
    act(() => { for (let i = 0; i < 300; i++) result.current.bpmDown(); });
    expect(result.current.bpm).toBe(40);
  });

  it('TAP은 최근 간격 4개 평균으로 BPM을 잡는다', () => {
    vi.useFakeTimers();
    const { result } = setup();
    act(() => { result.current.tap(); });
    for (let i = 0; i < 4; i++) {
      act(() => { vi.advanceTimersByTime(500); result.current.tap(); });
    }
    expect(result.current.bpm).toBe(120); // 500ms 간격 = 120 BPM
    vi.useRealTimers();
  });

  it('2초 이상 벌어진 간격은 평균에서 버린다', () => {
    vi.useFakeTimers();
    const { result } = setup();
    act(() => { result.current.tap(); });
    act(() => { vi.advanceTimersByTime(5000); result.current.tap(); });
    expect(result.current.bpm).toBe(72); // 반영되지 않음
    vi.useRealTimers();
  });

  it('끄면 박자 표시가 사라진다', () => {
    const { result } = setup();
    act(() => result.current.toggleMetro());
    expect(result.current.beat).toBe(0);
    act(() => result.current.toggleMetro());
    expect(result.current.metro).toBe(false);
    expect(result.current.beat).toBe(-1);
  });

  it('박자가 0→1→2→3→0으로 순환한다', () => {
    vi.useFakeTimers();
    const { result } = setup();
    act(() => { result.current.toggleMetro(); });
    expect(result.current.beat).toBe(0);
    const period = 60000 / result.current.bpm;
    act(() => { vi.advanceTimersByTime(period); });
    expect(result.current.beat).toBe(1);
    act(() => { vi.advanceTimersByTime(period); });
    expect(result.current.beat).toBe(2);
    act(() => { vi.advanceTimersByTime(period); });
    expect(result.current.beat).toBe(3);
    act(() => { vi.advanceTimersByTime(period); });
    expect(result.current.beat).toBe(0);
    vi.useRealTimers();
  });

  it('언마운트하면 interval을 정리한다', () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(global, 'clearInterval');
    const { result, unmount } = setup();
    act(() => { result.current.toggleMetro(); });
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
    vi.useRealTimers();
  });
});
