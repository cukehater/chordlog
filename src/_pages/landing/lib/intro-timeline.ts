import type { StringEndsType } from './stage'

/*
 * 로딩 화면 → 히어로 전환의 시간표와 계산. 모두 순수 함수라 테스트로 고정한다.
 * 단계 이름은 <html data-intro> 값과 같다(globals.css가 이 값으로 요소를 고른다).
 */

export type IntroPhaseType = 'pending' | 'loading' | 'morph' | 'reveal' | 'text' | 'strum' | 'done'

type ScheduleType = readonly (readonly [IntroPhaseType, number])[]

export const INTRO_TIMING = {
  /** 이 안에 장면이 준비되면 로딩 화면 없이 바로 드러낸다. */
  fastWindow: 150,
  /** 로딩 화면이 한 번 떴으면 줄이 한 번 울리는 동안은 둔다. */
  minLoading: 900,
  /** 준비 신호가 끝내 오지 않아도 이 시간이 지나면 전환한다. */
  safety: 8000,
} as const

/** 전환 시작(M) 기준 각 단계 시점(ms). */
const SCHEDULES = {
  loading: [
    ['morph', 0],
    ['reveal', 900],
    ['text', 1300],
    ['strum', 1700],
    ['done', 2500],
  ],
  fast: [
    ['reveal', 0],
    ['text', 400],
    ['strum', 800],
    ['done', 1600],
  ],
  // reduced-motion: 로딩 요소를 250ms 걷고 히어로 전체를 300ms에 드러낸다
  reducedLoading: [
    ['morph', 0],
    ['text', 250],
    ['strum', 250],
    ['done', 600],
  ],
  reducedFast: [
    ['text', 0],
    ['strum', 0],
    ['done', 350],
  ],
} satisfies Record<string, ScheduleType>

export const introSchedule = (showedLoader: boolean, reduced: boolean): ScheduleType => {
  if (reduced) return showedLoader ? SCHEDULES.reducedLoading : SCHEDULES.reducedFast
  return showedLoader ? SCHEDULES.loading : SCHEDULES.fast
}

/** 로딩 워드마크 크기(fs0)를 히어로 타이틀 크기(fs)로 나눈 값. CSS clamp와 같은 식이다. */
export const introTitleScale = (viewportWidth: number) => {
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
  return clamp(viewportWidth * 0.1, 40, 56) / clamp(viewportWidth * 0.11, 60, 176)
}

/** 줄 양 끝을 왼쪽 끝 기준 이동·회전·길이로 바꾼다. */
export const stringPose = ({ x1, y1, x2, y2 }: StringEndsType) => ({
  x: x1,
  y: y1,
  angle: Math.atan2(y2 - y1, x2 - x1),
  length: Math.hypot(x2 - x1, y2 - y1),
})

const C1 = 1.70158
const C3 = C1 + 1

/** easeOutBack. cubic-bezier(0.34, 1.56, 0.64, 1)의 근사로 운지 점이 살짝 넘쳤다가 앉는다. */
export const easeOutBack = (t: number) => 1 + C3 * (t - 1) ** 3 + C1 * (t - 1) ** 2

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

const DOT_STAGGER = 120
const DOT_POP = 420
const DOT_FADE = 200
const LABEL_DELAY = 360
const LABEL_FADE = 500

/**
 * strum 시작 후 elapsed ms가 지났을 때 운지 점과 코드 라벨의 상태.
 * elapsed가 null이면 아직 시작 전이라 모두 숨긴다. Infinity면 끝난 상태다.
 */
export const strumProgress = (elapsed: number | null, dotCount: number) => {
  if (elapsed === null) {
    return {
      dots: Array.from({ length: dotCount }, () => ({ scale: 0.4, opacity: 0 })),
      label: 0,
      settled: true,
    }
  }
  const dots = Array.from({ length: dotCount }, (_, i) => {
    const t = elapsed - i * DOT_STAGGER
    return { scale: 0.4 + 0.6 * easeOutBack(clamp01(t / DOT_POP)), opacity: clamp01(t / DOT_FADE) }
  })
  const end = Math.max((dotCount - 1) * DOT_STAGGER + DOT_POP, LABEL_DELAY + LABEL_FADE)
  return { dots, label: clamp01((elapsed - LABEL_DELAY) / LABEL_FADE), settled: elapsed >= end }
}
