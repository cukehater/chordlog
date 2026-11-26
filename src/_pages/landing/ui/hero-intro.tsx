'use client'

import { type CSSProperties, useEffect, useRef } from 'react'

import {
  INTRO_TIMING,
  type IntroPhaseType,
  introSchedule,
  introTitleScale,
  stringPose,
} from '../lib/intro-timeline'
import { usePrefersReducedMotion } from '../lib/pointer'
import { getIntroSnapshot, setIntroPhase, subscribeIntro, useIntro } from '../model/intro-store'

/** 로딩 화면의 줄 6가닥. 위에서부터 1번 줄(e). y는 220×72 줄 상자 안 중심, delay가 null이면 울리지 않는다(C 코드의 x). */
const LOADER_STRINGS = [
  { y: 8, thickness: 1, rgb: 'var(--intro-string-plain)', alpha: 0.8, delay: 0.4 },
  { y: 19, thickness: 1.2, rgb: 'var(--intro-string-plain)', alpha: 0.8, delay: 0.3 },
  { y: 30, thickness: 1.5, rgb: 'var(--intro-string-wound)', alpha: 0.85, delay: 0.2 },
  { y: 41, thickness: 1.8, rgb: 'var(--intro-string-wound)', alpha: 0.85, delay: 0.1 },
  { y: 52, thickness: 2.1, rgb: 'var(--intro-string-wound)', alpha: 0.85, delay: 0 },
  { y: 63, thickness: 2.4, rgb: 'var(--intro-string-wound)', alpha: 0.4, delay: null },
] as const

const BOX_WIDTH = 220

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, Math.max(0, ms))
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })

/** 장면이 준비되면 true, timeout이 먼저 지나면 false. */
const whenReady = async (timeout: number, signal: AbortSignal) => {
  if (getIntroSnapshot().ready) return true
  let unsubscribe = () => {}
  const ready = new Promise<boolean>((resolve) => {
    unsubscribe = subscribeIntro(() => {
      if (getIntroSnapshot().ready) resolve(true)
    })
  })
  try {
    return await Promise.race([ready, sleep(timeout, signal).then(() => false)])
  } finally {
    unsubscribe()
  }
}

/** 백그라운드 탭에서는 타이머가 늘어지므로 화면에 보일 때까지 기다린다. */
const whenVisible = (signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (document.visibilityState === 'visible') return resolve()
    const handleChange = () => {
      if (document.visibilityState !== 'visible') return
      document.removeEventListener('visibilitychange', handleChange)
      resolve()
    }
    document.addEventListener('visibilitychange', handleChange)
    signal.addEventListener(
      'abort',
      () => {
        document.removeEventListener('visibilitychange', handleChange)
        reject(signal.reason)
      },
      { once: true },
    )
  })

/**
 * 3D 지판이 준비될 때까지의 로딩 화면과 히어로 전환 타임라인.
 * 단계는 <html data-intro>에 적고, 요소별 모습은 globals.css가 정한다.
 * 첫 페인트 전에 root-layout의 인라인 스크립트가 data-intro="pending"을 걸어 둔다.
 */
export const HeroIntro = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { phase, landing, fallback } = useIntro()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const root = document.documentElement
    // 다른 페이지에서 넘어왔거나 이미 끝났다
    if (root.dataset.intro !== 'pending') {
      setIntroPhase('done')
      return
    }

    const main = ref.current?.closest('main')
    const controller = new AbortController()
    const { signal } = controller
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const enter = (next: IntroPhaseType) => {
      root.dataset.intro = next
      setIntroPhase(next)
    }
    const updateScale = () => {
      root.style.setProperty('--intro-scale', String(introTitleScale(window.innerWidth)))
    }

    main?.setAttribute('aria-busy', 'true')
    window.addEventListener('resize', updateScale, { signal })

    // 시각은 모두 페이지 시작(performance.now() = 0) 기준이다. CSS가 이 기준으로 150ms에 로딩 화면을 띄운다.
    const run = async () => {
      await whenVisible(signal)
      // 150ms가 지났으면 CSS가 이미 로딩 화면을 띄웠으니 준비 여부와 상관없이 로딩 경로로 간다
      const fast =
        performance.now() < INTRO_TIMING.fastWindow &&
        (await whenReady(INTRO_TIMING.fastWindow - performance.now(), signal))
      if (fast) {
        root.dataset.introPath = 'fast'
      } else {
        enter('loading')
        await Promise.all([
          sleep(INTRO_TIMING.fastWindow + INTRO_TIMING.minLoading - performance.now(), signal),
          whenReady(INTRO_TIMING.safety - performance.now(), signal),
        ])
        await whenVisible(signal)
      }

      const morphAt = performance.now()
      for (const [next, at] of introSchedule(!fast, prefersReduced)) {
        await sleep(at - (performance.now() - morphAt), signal)
        enter(next)
      }
      main?.removeAttribute('aria-busy')
    }

    run().catch(() => {
      // 언마운트로 중단됐다
    })
    return () => {
      controller.abort()
      main?.removeAttribute('aria-busy')
    }
  }, [])

  const leaving = phase !== 'pending' && phase !== 'loading'
  // 3D가 있고 움직임을 줄이지 않았으면 morph부터 줄이 지판 줄 위치로 날아간다
  const flying = leaving && !reduced && !fallback && landing !== null

  return (
    <div ref={ref} className="contents">
      {/* 로딩 화면은 서버 HTML에 들어가 pending 단계에서 CSS로 150ms 뒤에 나타난다(JS를 기다리지 않는다) */}
      <div className="pointer-events-none absolute inset-0 z-20" data-intro-part="loader">
        {LOADER_STRINGS.map((s, i) => {
          const pose = flying && landing[i] ? stringPose(landing[i]) : null
          const style = {
            height: s.thickness,
            width: pose ? pose.length : BOX_WIDTH,
            transform: pose
              ? `translate(${pose.x}px, ${pose.y - s.thickness / 2}px) rotate(${pose.angle}rad)`
              : `translate(calc(50vw - ${BOX_WIDTH / 2}px), calc(var(--intro-box-top) + ${s.y - s.thickness / 2}px)) rotate(0rad)`,
            '--fly-delay': `${(LOADER_STRINGS.length - 1 - i) * 50}ms`,
            '--strum-delay': `${s.delay ?? 0}s`,
          } as CSSProperties
          return (
            <div
              key={s.y}
              aria-hidden="true"
              className="intro-string absolute top-0 left-0 origin-[0_50%]"
              data-fade={leaving && !pose ? '' : undefined}
              style={style}
            >
              <div
                className={`absolute inset-0 ${s.delay === null ? '' : 'intro-line'}`}
                style={{ background: `rgb(${s.rgb} / ${s.alpha})` }}
              />
              {s.delay !== null && (
                <>
                  <div
                    className="intro-vib absolute top-[calc(50%-4.5px)] right-0 left-0 h-[9px] rounded-[50%]"
                    style={{
                      background: `linear-gradient(to bottom, rgb(${s.rgb} / 0), rgb(${s.rgb} / 0.5), rgb(${s.rgb} / 0))`,
                    }}
                  />
                  <div className="intro-sweep absolute top-[calc(50%-1.5px)] left-0 h-[3px] w-16 bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--color-accent)_80%,#fff6e6)_60%,transparent)]" />
                </>
              )}
            </div>
          )
        })}

        {/* 너트·새들 표시 */}
        <div
          aria-hidden="true"
          className="intro-chrome absolute top-[calc(var(--intro-box-top)+4px)] left-[calc(50vw-110px)] h-16 w-px bg-loader-mark"
        />
        <div
          aria-hidden="true"
          className="intro-chrome absolute top-[calc(var(--intro-box-top)+4px)] left-[calc(50vw+109px)] h-16 w-px bg-loader-mark"
        />

        <p
          aria-hidden="true"
          className="intro-chrome absolute top-[calc(var(--intro-box-top)+100px)] left-1/2 -translate-x-1/2 text-[14px] font-medium tracking-[0.02em] whitespace-nowrap text-ink-3"
        >
          코드 잡는 중<span className="intro-dot [--dot-delay:0s]">.</span>
          <span className="intro-dot [--dot-delay:0.2s]">.</span>
          <span className="intro-dot [--dot-delay:0.4s]">.</span>
        </p>
        {/* JS가 꺼져 있으면 로딩 화면 전체가 display:none이라 읽히지 않는다 */}
        <div className="sr-only" role="status">
          페이지를 불러오는 중입니다
        </div>
      </div>
    </div>
  )
}
