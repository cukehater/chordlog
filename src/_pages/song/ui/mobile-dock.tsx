'use client'

import type { SongType } from '@/entities/song'
import { keyLabel, transposeChord } from '@/shared/lib/chordpro'
import { MetronomeIcon, PauseIcon, PlayIcon } from '@/shared/ui/icons'
import { Stepper } from '@/shared/ui/stepper'

import type { usePlayView } from '../model/play-view'

type ViewType = ReturnType<typeof usePlayView>

const metroTone = (metro: boolean, beat: number) => {
  if (!metro) return 'bg-control text-ink-2'
  if (beat === 0) return 'bg-accent text-accent-ink'
  return 'bg-control text-accent'
}

export const MobileDock = ({ song, view }: { song: SongType; view: ViewType }) => {
  const current = transposeChord(song.key, view.semi)
  // 390px 폭에 44px 버튼 6개 + 값 2칸이 한 줄에 들어가도록 좌우 여백·간격을 최소로 둔다
  const dockBtn =
    'w-11 h-11 shrink-0 flex items-center justify-center border-0 rounded-xl cursor-pointer'

  return (
    <div className="fixed left-2 right-2 bottom-6 flex flex-col gap-[6px] bg-surface-3 border border-line-strong rounded-dock p-2 shadow-dock">
      {/* 위 — 오토스크롤 · 속도 · 메트로놈 · BPM */}
      <div className="flex items-center justify-between gap-[3px]">
        <button
          aria-label="오토스크롤 켜고 끄기"
          aria-pressed={view.scrolling}
          className={`${dockBtn} ${view.scrolling ? 'bg-accent text-accent-ink' : 'bg-control text-ink-2'}`}
          type="button"
          onClick={view.handleToggleScroll}
        >
          {view.scrolling ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
        </button>
        <Stepper
          decLabel="스크롤 속도 낮추기"
          incLabel="스크롤 속도 높이기"
          size="dock"
          sub="SCROLL"
          value={view.speedLabel}
          onDec={view.handleSpeedDown}
          onInc={view.handleSpeedUp}
        />

        <span className="w-px h-[26px] bg-line-strong" />

        <button
          aria-label="메트로놈 켜고 끄기"
          aria-pressed={view.metro}
          className={`${dockBtn} font-mono text-[17px] font-bold ${metroTone(view.metro, view.beat)}`}
          type="button"
          onClick={view.handleToggleMetro}
        >
          {view.metro ? String(view.beat + 1) : <MetronomeIcon size={16} />}
        </button>
        <Stepper
          decLabel="BPM 낮추기"
          incLabel="BPM 높이기"
          size="dock"
          sub="BPM"
          value={String(view.bpm)}
          onDec={view.handleBpmDown}
          onInc={view.handleBpmUp}
        />
      </div>

      {/* 아래 — 키 · 글자 크기 */}
      <div className="flex items-center gap-[6px]">
        <Stepper
          decLabel="키 반음 내리기"
          incLabel="키 반음 올리기"
          size="dock"
          sub={view.semi === 0 ? '원키' : keyLabel(view.semi)}
          value={current}
          onDec={view.handleKeyDown}
          onInc={view.handleKeyUp}
        />

        <span className="grow" />
        <span className="w-px h-[26px] bg-line-strong mx-[2px]" />

        <button
          aria-label="글자 작게"
          className={`${dockBtn} bg-control text-ink-2 text-[12px]`}
          type="button"
          onClick={view.handleFontDown}
        >
          가−
        </button>
        <button
          aria-label="글자 크게"
          className={`${dockBtn} bg-control text-ink-2 text-[16px]`}
          type="button"
          onClick={view.handleFontUp}
        >
          가+
        </button>
      </div>
    </div>
  )
}
