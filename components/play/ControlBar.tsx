'use client';

import type { Song } from '@/lib/types';
import type { usePlayView } from '@/lib/ui/playView';
import { transposeChord } from '@/lib/chordpro/transpose';
import { MicroLabel } from '@/components/ui/MicroLabel';
import { Stepper } from '@/components/ui/Stepper';
import { Segmented } from '@/components/ui/Segmented';
import { ToolToggle } from '@/components/ui/ToolToggle';
import { Fretboard } from '@/components/song/Fretboard';
import {
  PlayIcon, PauseIcon, MetronomeIcon, SoundOnIcon, SoundOffIcon, FocusIcon,
} from '@/components/icons';

type View = ReturnType<typeof usePlayView>;

const Divider = () => <span className="w-px h-[22px] bg-line" />;

export function ControlBar({ song, view }: { song: Song; view: View }) {
  const current = transposeChord(song.key, view.semi);

  return (
    <div className="shrink-0 bg-surface-2 border border-line rounded-lg flex flex-col">
      {/* 1단 — KEY */}
      <div className="flex items-center gap-3 p-[8px_14px] flex-wrap">
        <MicroLabel className="tracking-[0.14em]">KEY</MicroLabel>

        <div className="flex items-center gap-[2px] bg-bg border border-line rounded-md p-[3px]">
          <button type="button" aria-label="키 반음 내리기" onClick={view.keyDown}
            className="w-[34px] h-[30px] flex items-center justify-center rounded-[6px] text-[17px] text-ink-2 cursor-pointer">−</button>
          <span className="min-w-[52px] text-center font-mono text-[14px] font-bold text-accent">{current}</span>
          <button type="button" aria-label="키 반음 올리기" onClick={view.keyUp}
            className="w-[34px] h-[30px] flex items-center justify-center rounded-[6px] text-[17px] text-ink-2 cursor-pointer">+</button>
        </div>

        <button type="button" onClick={view.keyReset}
          className="h-[30px] px-[10px] border border-line rounded-lg font-mono text-[11px] text-ink-4 cursor-pointer">
          RESET
        </button>

        <Divider />

        <span className="flex items-center gap-2 font-mono text-[11.5px] text-ink-4">
          <Fretboard fret={song.capo} size="bar" />
          CAPO {song.capo > 0 ? `${song.capo}프렛` : '없음'}
        </span>

        <span className="flex items-center gap-[7px] font-mono text-[11.5px] text-ink-4">
          <span className="text-[9.5px] tracking-[0.12em] text-dim">TUNING</span>{song.tuning}
        </span>

        <Divider />

        <div className="flex items-center gap-[6px]">
          <button type="button" aria-label="글자 크기 줄이기" onClick={view.fontDown}
            className="w-[32px] h-[30px] flex items-center justify-center border border-line rounded-lg text-[11px] text-ink-2 cursor-pointer">가−</button>
          <button type="button" aria-label="글자 크기 키우기" onClick={view.fontUp}
            className="w-[32px] h-[30px] flex items-center justify-center border border-line rounded-lg text-[14px] text-ink-2 cursor-pointer">가+</button>
        </div>

        <Segmented
          value={String(view.cols)}
          onChange={(v) => view.setCols(v === '1' ? 1 : 2)}
          options={[{ value: '1', label: '1단' }, { value: '2', label: '2단' }]}
        />

        <button type="button" onClick={view.toggleFocus}
          className="ml-auto h-[32px] px-[14px] flex items-center gap-2 border border-line rounded-lg text-[13px] font-medium text-ink-2 cursor-pointer">
          <FocusIcon />{view.focus ? '집중 모드 끄기' : '집중 모드'}
        </button>
      </div>

      <div className="h-px bg-line-soft" />

      {/* 2단 — PLAY */}
      <div className="flex items-center gap-3 p-[8px_14px] flex-wrap">
        <MicroLabel className="tracking-[0.14em]">PLAY</MicroLabel>

        <ToolToggle
          active={view.scrolling}
          onClick={view.toggleScroll}
          icon={view.scrolling ? <PauseIcon /> : <PlayIcon />}
          label={view.scrolling ? '멈춤' : '오토스크롤'}
        />
        <Stepper
          value={view.speedLabel} sub={view.speedPx}
          onDec={view.speedDown} onInc={view.speedUp}
          decLabel="스크롤 속도 낮추기" incLabel="스크롤 속도 높이기"
        />

        <Divider />

        <ToolToggle
          active={view.metro}
          onClick={view.toggleMetro}
          icon={<MetronomeIcon />}
          label={view.metro ? '박자 끄기' : '메트로놈'}
        />

        <span className="flex items-center gap-[6px]">
          {[0, 1, 2, 3].map((i) => {
            const live = view.metro && view.beat === i;
            const size = i === 0 ? 9 : 7;
            return (
              <span
                key={i}
                data-beat-dot
                style={{ width: size, height: size, boxShadow: live ? '0 0 0 4px rgba(255,157,77,0.16)' : undefined }}
                className={`rounded-full ${live ? 'bg-accent' : 'bg-line-strong'}`}
              />
            );
          })}
        </span>

        <Stepper
          value={String(view.bpm)} sub="BPM"
          onDec={view.bpmDown} onInc={view.bpmUp}
          decLabel="BPM 낮추기" incLabel="BPM 높이기"
        />

        <button type="button" onClick={view.tap}
          className="h-[32px] px-3 border border-line rounded-lg font-mono text-[11px] tracking-[0.1em] text-ink-4 cursor-pointer">
          TAP
        </button>

        <button type="button" aria-label="메트로놈 소리 켜고 끄기" aria-pressed={view.muted} onClick={view.toggleMute}
          className={`w-[32px] h-[32px] flex items-center justify-center border border-line rounded-lg cursor-pointer ${
            view.muted ? 'text-dim' : 'text-ink-2'
          }`}>
          {view.muted ? <SoundOffIcon /> : <SoundOnIcon />}
        </button>

        <span className="ml-auto text-[11.5px] text-faint">
          {view.scrolling
            ? '1단으로 바뀌고 악보가 저절로 내려갑니다 — 아무 버튼이나 누르면 멈춰요'
            : '오토스크롤을 켜면 1단 보기로 전환됩니다'}
        </span>
      </div>
    </div>
  );
}
