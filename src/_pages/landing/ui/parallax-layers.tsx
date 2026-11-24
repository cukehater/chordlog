'use client'

import { useEffect, useRef } from 'react'

import { easeFactor, usePointerTarget, usePrefersReducedMotion } from '../lib/pointer'

/** 레이어별 최대 이동량(px). 가까운 레이어일수록 많이 움직이고, 마우스 반대 방향으로 간다. */
const DEPTHS = {
  far: [10, 8],
  mid: [24, 18],
  near: [46, 34],
} as const

const EASE = 0.08

/**
 * 3D 장면과 타이틀 사이에 놓이는 장식 레이어 3겹.
 * 가로 화면 위치는 1440px 시안 기준이고, 세로(portrait) 화면에서는 일부를 숨기고 자리를 옮긴다.
 */
export const ParallaxLayers = () => {
  const reduced = usePrefersReducedMotion()
  const farRef = useRef<HTMLDivElement>(null)
  const midRef = useRef<HTMLDivElement>(null)
  const nearRef = useRef<HTMLDivElement>(null)
  const kick = useRef(() => {})
  const target = usePointerTarget(!reduced, () => kick.current())

  useEffect(() => {
    const layers = [
      [farRef.current, DEPTHS.far],
      [midRef.current, DEPTHS.mid],
      [nearRef.current, DEPTHS.near],
    ] as const
    const current = { x: 0, y: 0 }
    let frame = 0
    let last = 0

    const apply = () => {
      for (const [element, [dx, dy]] of layers) {
        if (element) {
          element.style.transform = `translate3d(${(-current.x * dx).toFixed(2)}px, ${(-current.y * dy).toFixed(2)}px, 0)`
        }
      }
    }

    const tick = (now: number) => {
      const goal = target.current
      const t = easeFactor(EASE, (now - last) / 1000)
      last = now
      current.x += (goal.x - current.x) * t
      current.y += (goal.y - current.y) * t
      const settled = Math.abs(goal.x - current.x) < 1e-3 && Math.abs(goal.y - current.y) < 1e-3
      if (settled) {
        current.x = goal.x
        current.y = goal.y
      }
      apply()
      frame = settled ? 0 : requestAnimationFrame(tick)
    }

    kick.current = () => {
      if (reduced) {
        current.x = 0
        current.y = 0
        apply()
        return
      }
      if (!frame) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }
    kick.current()

    return () => {
      cancelAnimationFrame(frame)
      kick.current = () => {}
    }
  }, [reduced, target])

  return (
    <>
      {/* 먼 레이어: 오선 위 코드 진행, 작은 심볼 */}
      <div
        ref={farRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-ink/24 will-change-transform"
      >
        <svg
          className="absolute top-[7%] left-[44%] h-auto w-[clamp(330px,30.556vw,550px)] overflow-visible portrait:top-[6.5%] portrait:left-[42%] portrait:w-[min(61.333vw,368px)]"
          fill="none"
          viewBox="0 0 440 120"
        >
          <path
            d="M0 50H440M0 60H440M0 70H440M0 80H440M0 90H440"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M4 50V90M114 50V90M224 50V90M334 50V90"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M22 76L30 64M46 76L54 64M70 76L78 64M94 76L102 64M132 76L140 64M156 76L164 64M180 76L188 64M204 76L212 64M242 76L250 64M266 76L274 64M290 76L298 64M314 76L322 64M352 76L360 64M376 76L384 64M400 76L408 64M424 76L432 64"
            stroke="currentColor"
            strokeWidth="5"
          />
          <g
            className="font-display"
            fill="currentColor"
            fontSize="22"
            fontStyle="italic"
            fontWeight="600"
          >
            <text x="12" y="36">
              C
            </text>
            <text x="122" y="36">
              Am
            </text>
            <text x="232" y="36">
              F
            </text>
            <text x="342" y="36">
              G
            </text>
          </g>
        </svg>
        <span className="absolute top-[88%] left-[31%] font-display text-[30px] leading-none font-medium italic portrait:hidden">
          Dsus4
        </span>
      </div>

      {/* 중간 레이어: Am, Dm 코드 다이어그램, C 아르페지오 탭 */}
      <div
        ref={midRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-ink/42 will-change-transform"
      >
        <span className="absolute top-[25%] left-[70%] font-display text-[clamp(57px,5.278vw,95px)] leading-none font-medium italic portrait:top-[6.5%] portrait:left-[6.5%] portrait:text-[min(11.2vw,67.2px)]">
          Am
        </span>
        <svg
          className="absolute top-[8%] left-[86.5%] h-[132px] w-[92px] overflow-visible portrait:hidden"
          fill="none"
          viewBox="0 0 92 132"
        >
          <text
            className="font-display"
            fill="currentColor"
            fontSize="20"
            fontStyle="italic"
            fontWeight="600"
            textAnchor="middle"
            x="46.5"
            y="18"
          >
            Dm
          </text>
          <path d="M14 40H79" stroke="currentColor" strokeLinecap="square" strokeWidth="4" />
          <path
            d="M14 61H79M14 82H79M14 103H79M14 124H79"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M14 40V124M27 40V124M40 40V124M53 40V124M66 40V124M79 40V124"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M10.5 27.5L17.5 34.5M17.5 27.5L10.5 34.5M23.5 27.5L30.5 34.5M30.5 27.5L23.5 34.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.6"
          />
          <circle cx="40" cy="31" r="3.6" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="53" cy="71.5" fill="currentColor" r="5.5" />
          <circle cx="66" cy="92.5" fill="currentColor" r="5.5" />
          <circle cx="79" cy="50.5" fill="currentColor" r="5.5" />
        </svg>
        <svg
          className="absolute top-[77%] left-[77.5%] h-auto w-[clamp(195px,18.056vw,325px)] overflow-visible portrait:top-[85.5%] portrait:left-1/2 portrait:w-[min(40vw,240px)]"
          fill="none"
          viewBox="0 0 260 150"
        >
          <path
            d="M36 20H182M198 20H256M36 42H152M168 42H212M228 42H256M36 64H122M138 64H256M36 86H92M108 86H256M36 108H62M78 108H256M36 130H256"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path d="M36 20V130M256 20V130" stroke="currentColor" strokeWidth="1.6" />
          <g
            className="font-mono"
            fill="currentColor"
            fontSize="15"
            fontWeight="600"
            textAnchor="middle"
          >
            <text x="70" y="113">
              3
            </text>
            <text x="100" y="91">
              2
            </text>
            <text x="130" y="69">
              0
            </text>
            <text x="160" y="47">
              1
            </text>
            <text x="190" y="25">
              0
            </text>
            <text x="220" y="47">
              1
            </text>
          </g>
          <g
            className="font-mono"
            fill="currentColor"
            fontSize="14"
            fontWeight="600"
            textAnchor="middle"
          >
            <text x="16" y="56">
              T
            </text>
            <text x="16" y="81">
              A
            </text>
            <text x="16" y="106">
              B
            </text>
          </g>
        </svg>
      </div>

      {/* 가까운 레이어: 흐릿한 G7, Cmaj7 */}
      <div
        ref={nearRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 will-change-transform"
      >
        <span className="absolute top-[74%] left-[7%] font-display text-[clamp(96px,8.889vw,160px)] leading-none font-semibold text-accent italic opacity-50 blur-[2px] portrait:top-[88.5%] portrait:left-[5%] portrait:text-[min(13.867vw,83.2px)]">
          G7
        </span>
        <span className="absolute top-[10%] left-[8.5%] font-display text-[40px] leading-none font-medium text-accent italic opacity-80 portrait:hidden">
          Cmaj7
        </span>
      </div>
    </>
  )
}
