'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const BASE_PX_PER_SEC = 25; // 1.0× 기준
const DEFAULT_SPEED_IDX = 2;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function clampBpm(v: number) {
  return clamp(Math.round(v), 40, 240);
}

export function usePlayView({ tempo, initialSemi = 0 }: { tempo: number; initialSemi?: number }) {
  const [semi, setSemi] = useState(initialSemi);
  const [fontSize, setFontSize] = useState(18);
  const [cols, setColsState] = useState<1 | 2>(2);
  const [focus, setFocus] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(DEFAULT_SPEED_IDX);
  const [metro, setMetro] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [bpm, setBpmState] = useState(tempo);
  const [muted, setMuted] = useState(false);

  // SongDetailView가 데스크톱·모바일 트리를 동시에 마운트하고 둘 다에
  // 이 ref를 넘기므로(display:none인 쪽도 포함), 단일 useRef로는 마지막에
  // 커밋된 쪽이 덮어써 버린다. 콜백 ref로 두 요소를 모두 모아두고
  // rAF 루프에서 실제로 보이는(clientHeight > 0) 쪽을 골라 스크롤한다.
  const sheets = useRef(new Set<HTMLDivElement>());
  const sheetRef = useCallback((el: HTMLDivElement) => {
    sheets.current.add(el);
    return () => { sheets.current.delete(el); };
  }, []);
  const taps = useRef<number[]>([]);

  /* ── 오토스크롤 ── 실제 스크롤은 rAF로 굴린다.
     배속 1.0× = 25px/s. 끝에 닿으면 자동 정지. */
  useEffect(() => {
    if (!scrolling) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const el = [...sheets.current].find((n) => n.clientHeight > 0);
      if (!el) { raf = requestAnimationFrame(step); return; }
      const dt = (now - last) / 1000;
      last = now;
      el.scrollTop += SPEEDS[speedIdx] * BASE_PX_PER_SEC * dt;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        setScrolling(false);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [scrolling, speedIdx]);

  /* ── 메트로놈 ── 지금은 시각 박자만 돈다.
     ponytail: setInterval 시각 전용. 소리를 붙일 때는 Web Audio 스케줄러
     (ctx.currentTime 기준 lookahead ~100ms)로 바꾼다 — 탭이 백그라운드로 가면
     setInterval은 박자가 흔들린다. (docs/design/README.md §5-5)
     ponytail: bpm이 바뀔 때마다 이 effect가 재실행되어 interval이 처음부터
     다시 시작한다 — 재생 중 BPM을 조정하면 박자 간격이 흔들린다. Web Audio
     스케줄러로 옮길 때 함께 해결된다. */
  useEffect(() => {
    if (!metro) return;
    const id = setInterval(() => {
      setBeat((b) => (b + 1) % 4);
    }, 60000 / bpm);
    return () => clearInterval(id);
  }, [metro, bpm]);

  const setCols = useCallback((n: 1 | 2) => {
    if (n === 2) setScrolling(false); // 2단은 가로로 흐르는 레이아웃 — 세로 스크롤과 맞지 않는다
    setColsState(n);
  }, []);

  const toggleScroll = useCallback(() => {
    setScrolling((on) => {
      if (!on) setColsState(1); // 켜면 1단으로 강제 전환
      return !on;
    });
  }, []);

  const setBpm = useCallback((v: number) => setBpmState(clampBpm(v)), []);

  const tap = useCallback(() => {
    const now = Date.now();
    taps.current.push(now);
    if (taps.current.length > 5) taps.current.shift();
    const gaps: number[] = [];
    for (let i = 1; i < taps.current.length; i++) {
      const g = taps.current[i] - taps.current[i - 1];
      if (g < 2000) gaps.push(g);
    }
    if (!gaps.length) return;
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    setBpm(60000 / avg);
  }, [setBpm]);

  const toggleMetro = useCallback(() => {
    setMetro((on) => {
      setBeat(on ? -1 : 0);
      return !on;
    });
  }, []);

  const speed = SPEEDS[speedIdx];

  return {
    semi,
    keyUp: () => setSemi((s) => clamp(s + 1, -11, 11)),
    keyDown: () => setSemi((s) => clamp(s - 1, -11, 11)),
    keyReset: () => setSemi(0),

    fontSize,
    fontUp: () => setFontSize((v) => clamp(v + 1, 13, 30)),
    fontDown: () => setFontSize((v) => clamp(v - 1, 13, 30)),

    cols, setCols,
    focus, toggleFocus: () => setFocus((f) => !f),

    scrolling, toggleScroll, sheetRef,
    speedIdx,
    speedUp: () => setSpeedIdx((i) => clamp(i + 1, 0, SPEEDS.length - 1)),
    speedDown: () => setSpeedIdx((i) => clamp(i - 1, 0, SPEEDS.length - 1)),
    speedLabel: `${speed}×`,
    speedPx: `${Math.round(speed * BASE_PX_PER_SEC)} PX/S`,

    metro, toggleMetro, beat,
    bpm, setBpm,
    bpmUp: () => setBpmState((b) => clampBpm(b + 1)),
    bpmDown: () => setBpmState((b) => clampBpm(b - 1)),
    tap,
    muted, toggleMute: () => setMuted((m) => !m),
  };
}
