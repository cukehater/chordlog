'use client'

import type { ReactNode } from 'react'

import type { SongType } from '@/entities/song'
import { keyLabel, transposeChord } from '@/shared/lib/chordpro'
import {
  FocusIcon,
  MetronomeIcon,
  PauseIcon,
  PlayIcon,
  SoundOffIcon,
  SoundOnIcon,
} from '@/shared/ui/icons'
import { Segmented } from '@/shared/ui/segmented'
import { Stepper } from '@/shared/ui/stepper'
import { ToolToggle } from '@/shared/ui/tool-toggle'

import type { usePlayView } from '../model/play-view'

type ViewType = ReturnType<typeof usePlayView>

const Divider = () => <span aria-hidden="true" className="w-px h-6 bg-line" />

// 버튼과 값이 스스로 무엇인지 말하므로 그룹 이름은 보조기술에만 준다
const Group = ({ label, children }: { label: string; children: ReactNode }) => {
  return (
    <div aria-label={label} className="flex items-center gap-2" role="group">
      {children}
    </div>
  )
}

const btnBase =
  'h-9 flex items-center justify-center border border-line rounded-md bg-bg text-[13px] text-ink-3 cursor-pointer hover:bg-surface-2'
const plainBtn = `${btnBase} px-3`
const iconBtn = `${btnBase} w-9 shrink-0`

export const ControlBar = ({ song, view }: { song: SongType; view: ViewType }) => {
  const current = transposeChord(song.key, view.semi)

  return (
    <div className="shrink-0 border-y border-line bg-bg">
      <div className="page-grid py-[10px] flex items-center gap-x-3 gap-y-2 flex-wrap">
        <Group label="Transpose">
          <Stepper
            decLabel="키 반음 내리기"
            incLabel="키 반음 올리기"
            sub={view.semi === 0 ? '원키' : keyLabel(view.semi)}
            value={current}
            onDec={view.handleKeyDown}
            onInc={view.handleKeyUp}
          />
          {view.semi !== 0 ? (
            <button className={plainBtn} type="button" onClick={view.handleKeyReset}>
              원키로
            </button>
          ) : null}
        </Group>

        <Divider />

        <Group label="Autoscroll">
          <ToolToggle
            active={view.scrolling}
            icon={view.scrolling ? <PauseIcon /> : <PlayIcon />}
            label={view.scrolling ? '멈춤' : '오토스크롤'}
            onClick={view.handleToggleScroll}
          />
          <Stepper
            decLabel="스크롤 속도 낮추기"
            incLabel="스크롤 속도 높이기"
            sub={view.speedPx}
            value={view.speedLabel}
            onDec={view.handleSpeedDown}
            onInc={view.handleSpeedUp}
          />
        </Group>

        <Divider />

        <Group label="Font">
          <div className="h-9 flex border border-line rounded-md overflow-hidden divide-x divide-line">
            <button
              aria-label="글자 크기 줄이기"
              className="w-10 bg-bg text-[12px] text-ink-3 cursor-pointer hover:bg-surface-2"
              type="button"
              onClick={view.handleFontDown}
            >
              가−
            </button>
            <button
              aria-label="글자 크기 키우기"
              className="w-10 bg-bg text-[15px] text-ink-3 cursor-pointer hover:bg-surface-2"
              type="button"
              onClick={view.handleFontUp}
            >
              가+
            </button>
          </div>
          <Segmented
            options={[
              { value: '1', label: '1단' },
              { value: '2', label: '2단' },
            ]}
            value={String(view.cols)}
            onChange={(v) => view.setCols(v === '1' ? 1 : 2)}
          />
        </Group>

        <Divider />

        <Group label="Metronome">
          <ToolToggle
            active={view.metro}
            icon={<MetronomeIcon />}
            label={view.metro ? '박자 끄기' : '메트로놈'}
            onClick={view.handleToggleMetro}
          />
          <span aria-hidden="true" className="flex items-center gap-[5px] px-1">
            {[0, 1, 2, 3].map((i) => {
              const live = view.metro && view.beat === i
              const size = i === 0 ? 9 : 7
              return (
                <span
                  key={i}
                  data-beat-dot
                  className={`rounded-full ${live ? 'bg-accent ring-4 ring-accent-soft' : 'bg-line-strong'}`}
                  style={{ width: size, height: size }}
                />
              )
            })}
          </span>
          <Stepper
            decLabel="BPM 낮추기"
            incLabel="BPM 높이기"
            sub="BPM"
            value={String(view.bpm)}
            onDec={view.handleBpmDown}
            onInc={view.handleBpmUp}
          />
          <button className={plainBtn} type="button" onClick={view.handleTap}>
            TAP
          </button>
          <button
            aria-label="메트로놈 음소거"
            aria-pressed={view.muted}
            className={`${iconBtn} ${view.muted ? 'text-ink-5' : ''}`}
            type="button"
            onClick={view.handleToggleMute}
          >
            {view.muted ? <SoundOffIcon size={16} /> : <SoundOnIcon size={16} />}
          </button>
        </Group>

        <button
          aria-label={view.focus ? '집중 모드 끄기' : '집중 모드'}
          aria-pressed={view.focus}
          className={`${iconBtn} ml-auto ${view.focus ? 'border-accent text-accent' : ''}`}
          title={view.focus ? '집중 모드 끄기' : '집중 모드'}
          type="button"
          onClick={view.handleToggleFocus}
        >
          <FocusIcon size={16} />
        </button>
      </div>
    </div>
  )
}
