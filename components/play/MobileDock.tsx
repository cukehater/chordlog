'use client';

import type { Song } from '@/lib/types';
import type { usePlayView } from '@/lib/ui/playView';
import { transposeChord, keyLabel } from '@/lib/chordpro/transpose';
import { Stepper } from '@/components/ui/Stepper';
import { PlayIcon, PauseIcon, MetronomeIcon } from '@/components/icons';

type View = ReturnType<typeof usePlayView>;

export function MobileDock({ song, view }: { song: Song; view: View }) {
  const current = transposeChord(song.key, view.semi);
  // 390px 폭에 44px 버튼 6개 + 값 2칸이 한 줄에 들어가도록 좌우 여백·간격을 최소로 둔다
  const dockBtn = 'w-11 h-11 shrink-0 flex items-center justify-center border-0 rounded-xl cursor-pointer';

  return (
    <div className="fixed left-2 right-2 bottom-6 flex flex-col gap-[6px] bg-surface-3 border border-line-strong rounded-dock p-2 shadow-dock">
      {/* 위 — 오토스크롤 · 속도 · 메트로놈 · BPM */}
      <div className="flex items-center justify-between gap-[3px]">
        <button
          type="button"
          aria-label="오토스크롤 켜고 끄기"
          aria-pressed={view.scrolling}
          onClick={view.toggleScroll}
          className={`${dockBtn} ${view.scrolling ? 'bg-accent text-accent-ink' : 'bg-control text-ink-2'}`}
        >
          {view.scrolling ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
        </button>
        <Stepper
          size="dock" value={view.speedLabel} sub="SCROLL"
          onDec={view.speedDown} onInc={view.speedUp}
          decLabel="스크롤 속도 낮추기" incLabel="스크롤 속도 높이기"
        />

        <span className="w-px h-[26px] bg-line-strong" />

        <button
          type="button"
          aria-label="메트로놈 켜고 끄기"
          aria-pressed={view.metro}
          onClick={view.toggleMetro}
          className={`${dockBtn} font-mono text-[17px] font-bold ${
            view.metro && view.beat === 0
              ? 'bg-accent text-accent-ink'
              : view.metro
                ? 'bg-control text-accent'
                : 'bg-control text-ink-2'
          }`}
        >
          {view.metro ? String(view.beat + 1) : <MetronomeIcon size={16} />}
        </button>
        <Stepper
          size="dock" value={String(view.bpm)} sub="BPM"
          onDec={view.bpmDown} onInc={view.bpmUp}
          decLabel="BPM 낮추기" incLabel="BPM 높이기"
        />
      </div>

      {/* 아래 — 키 · 글자 크기 */}
      <div className="flex items-center gap-[6px]">
        <Stepper
          size="dock" value={current} sub={view.semi === 0 ? '원키' : keyLabel(view.semi)}
          onDec={view.keyDown} onInc={view.keyUp}
          decLabel="키 반음 내리기" incLabel="키 반음 올리기"
        />

        <span className="grow" />
        <span className="w-px h-[26px] bg-line-strong mx-[2px]" />

        <button type="button" aria-label="글자 작게" onClick={view.fontDown}
          className={`${dockBtn} bg-control text-ink-2 text-[12px]`}>가−</button>
        <button type="button" aria-label="글자 크게" onClick={view.fontUp}
          className={`${dockBtn} bg-control text-ink-2 text-[16px]`}>가+</button>
      </div>
    </div>
  );
}
