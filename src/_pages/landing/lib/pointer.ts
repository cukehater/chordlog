'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** prefers-reduced-motion: reduce 여부. 서버 렌더링 중에는 false. */
export const usePrefersReducedMotion = () => {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  )
}

export type PointerTargetType = { x: number; y: number }

const clampUnit = (value: number) => Math.max(-1, Math.min(1, value))

/**
 * 마우스 위치를 화면 기준 -1..1로 담은 ref를 돌려준다. 값이 바뀔 때마다 onChange를 부른다.
 * 터치·펜 입력은 무시해서 터치 기기에서는 정지 상태로 남는다.
 * enabled가 false면 0으로 되돌리고 듣지 않는다.
 */
export const usePointerTarget = (enabled: boolean, onChange: () => void) => {
  const target = useRef<PointerTargetType>({ x: 0, y: 0 })
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  useEffect(() => {
    const point = target.current
    const reset = () => {
      point.x = 0
      point.y = 0
      onChangeRef.current()
    }

    reset()
    if (!enabled) return

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      point.x = clampUnit((event.clientX / window.innerWidth) * 2 - 1)
      point.y = clampUnit((event.clientY / window.innerHeight) * 2 - 1)
      onChangeRef.current()
    }

    const root = document.documentElement
    window.addEventListener('pointermove', move, { passive: true })
    root.addEventListener('mouseleave', reset)
    window.addEventListener('blur', reset)
    return () => {
      window.removeEventListener('pointermove', move)
      root.removeEventListener('mouseleave', reset)
      window.removeEventListener('blur', reset)
    }
  }, [enabled])

  return target
}

/** 프레임 간격과 상관없이 같은 속도로 다가가는 lerp 계수. 60fps에서 base와 같다. */
export const easeFactor = (base: number, deltaSeconds: number) => {
  return 1 - Math.pow(1 - base, Math.min(deltaSeconds, 1 / 30) * 60)
}
