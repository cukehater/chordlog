'use client'

import { useSyncExternalStore } from 'react'

import type { IntroPhaseType } from '../lib/intro-timeline'
import type { StringEndsType } from '../lib/stage'

/*
 * 히어로 인트로 상태. Hero는 서버 컴포넌트이고 로딩 화면·3D 장면·패럴랙스는 형제 클라이언트
 * 컴포넌트라서 모듈 스토어 하나로 나눠 쓴다.
 */

type IntroStateType = {
  phase: IntroPhaseType
  /** 3D 장면이 웹폰트 텍스처로 첫 프레임을 그렸거나, 3D 대신 정적 배경이 섰다. */
  ready: boolean
  /** 3D 없이 정적 배경으로 끝나는 경우. 줄이 날아갈 곳이 없다. */
  fallback: boolean
  /** strum 단계가 시작된 performance.now() 값. */
  strumAt: number | null
  /** 지판 줄 6개의 화면 좌표. 장면이 계산해 넣는다. */
  landing: readonly StringEndsType[] | null
}

const INITIAL: IntroStateType = {
  phase: 'pending',
  ready: false,
  fallback: false,
  strumAt: null,
  landing: null,
}

let state = INITIAL
const listeners = new Set<() => void>()

const update = (patch: Partial<IntroStateType>) => {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

export const subscribeIntro = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getIntroSnapshot = () => state

export const useIntro = () => useSyncExternalStore(subscribeIntro, getIntroSnapshot, () => INITIAL)

export const markIntroReady = () => {
  if (!state.ready) update({ ready: true })
}

export const markIntroFallback = () => {
  if (!state.fallback) update({ ready: true, fallback: true })
}

export const setIntroLanding = (landing: readonly StringEndsType[]) => update({ landing })

export const setIntroPhase = (phase: IntroPhaseType) => {
  update(phase === 'strum' ? { phase, strumAt: performance.now() } : { phase })
}
