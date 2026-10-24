'use client';

import type { ReactNode } from 'react';
import type { Song } from '@/lib/types';
import type { usePlayView } from '@/lib/ui/playView';
import { transposeChord, keyLabel } from '@/lib/chordpro/transpose';
import { Stepper } from '@/components/ui/Stepper';
import { Segmented } from '@/components/ui/Segmented';
import { ToolToggle } from '@/components/ui/ToolToggle';
import {
  PlayIcon, PauseIcon, MetronomeIcon, SoundOnIcon, SoundOffIcon, FocusIcon,
} from '@/components/icons';

type View = ReturnType<typeof usePlayView>;

const Divider = () => <span aria-hidden="true" className="w-px h-6 bg-line" />;

// 버튼과 값이 스스로 무엇인지 말하므로 그룹 이름은 보조기술에만 준다
function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      {children}
    </div>
  );
}

const btnBase = 'h-9 flex items-center justify-center border border-line rounded-md bg-bg text-[13px] text-ink-3 cursor-pointer hover:bg-surface-2';
const plainBtn = `${btnBase} px-3`;
const iconBtn = `${btnBase} w-9 shrink-0`;

export function ControlBar({ song, view }: { song: Song; view: View }) {
  const current = transposeChord(song.key, view.semi);

  return (
    <div className="shrink-0 border-y border-line bg-bg">
      <div className="w-full max-w-[1360px] mx-auto box-border px-10 py-[10px] flex items-center gap-x-3 gap-y-2 flex-wrap">
        <Group label="Transpose">
          <Stepper
            value={current} sub={view.semi === 0 ? '원키' : keyLabel(view.semi)}
            onDec={view.keyDown} onInc={view.keyUp}
            decLabel="키 반음 내리기" incLabel="키 반음 올리기"
          />
          {view.semi !== 0 ? (
            <button type="button" onClick={view.keyReset} className={plainBtn}>원키로</button>
          ) : null}
        </Group>

        <Divider />

        <Group label="Autoscroll">
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
        </Group>

        <Divider />

        <Group label="Font">
          <div className="h-9 flex border border-line rounded-md overflow-hidden divide-x divide-line">
            <button type="button" aria-label="글자 크기 줄이기" onClick={view.fontDown}
              className="w-10 bg-bg text-[12px] text-ink-3 cursor-pointer hover:bg-surface-2">가−</button>
            <button type="button" aria-label="글자 크기 키우기" onClick={view.fontUp}
              className="w-10 bg-bg text-[15px] text-ink-3 cursor-pointer hover:bg-surface-2">가+</button>
          </div>
          <Segmented
            value={String(view.cols)}
            onChange={(v) => view.setCols(v === '1' ? 1 : 2)}
            options={[{ value: '1', label: '1단' }, { value: '2', label: '2단' }]}
          />
        </Group>

        <Divider />

        <Group label="Metronome">
          <ToolToggle
            active={view.metro}
            onClick={view.toggleMetro}
            icon={<MetronomeIcon />}
            label={view.metro ? '박자 끄기' : '메트로놈'}
          />
          <span className="flex items-center gap-[5px] px-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => {
              const live = view.metro && view.beat === i;
              const size = i === 0 ? 9 : 7;
              return (
                <span
                  key={i}
                  data-beat-dot
                  style={{ width: size, height: size }}
                  className={`rounded-full ${live ? 'bg-accent ring-4 ring-accent-soft' : 'bg-line-strong'}`}
                />
              );
            })}
          </span>
          <Stepper
            value={String(view.bpm)} sub="BPM"
            onDec={view.bpmDown} onInc={view.bpmUp}
            decLabel="BPM 낮추기" incLabel="BPM 높이기"
          />
          <button type="button" onClick={view.tap} className={plainBtn}>TAP</button>
          <button type="button" aria-label="메트로놈 음소거" aria-pressed={view.muted} onClick={view.toggleMute}
            className={`${iconBtn} ${view.muted ? 'text-ink-5' : ''}`}>
            {view.muted ? <SoundOffIcon size={16} /> : <SoundOnIcon size={16} />}
          </button>
        </Group>

        <button type="button" onClick={view.toggleFocus} aria-pressed={view.focus}
          aria-label={view.focus ? '집중 모드 끄기' : '집중 모드'} title={view.focus ? '집중 모드 끄기' : '집중 모드'}
          className={`${iconBtn} ml-auto ${view.focus ? 'border-accent text-accent' : ''}`}>
          <FocusIcon size={16} />
        </button>
      </div>
    </div>
  );
}
