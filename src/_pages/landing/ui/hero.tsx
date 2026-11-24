import Link from 'next/link'

import { siteConfig, splitName } from '@/shared/config'

import { FretboardBackground } from './fretboard-background'
import { ParallaxLayers } from './parallax-layers'

/**
 * 스크롤 없는 한 화면 히어로.
 * 타이틀과 CTA는 서버에서 렌더링해서 3D가 늦게 뜨거나 실패해도 그대로 보인다.
 */
export const Hero = () => {
  const [head, tail] = splitName()

  return (
    <main className="bg-hero relative isolate h-dvh overflow-hidden text-ink">
      <FretboardBackground />
      <ParallaxLayers />

      <div className="relative z-10 flex flex-col items-start gap-[clamp(28px,4.4dvh,44px)] px-[clamp(24px,7vw,112px)] pt-[clamp(88px,24dvh,240px)]">
        <div className="flex flex-col gap-[clamp(14px,2.4dvh,24px)]">
          <h1 className="font-display text-[clamp(60px,11vw,176px)] leading-[0.9] font-semibold tracking-[-0.035em] text-ink">
            {head}
            {tail && <span className="font-medium text-accent italic">{tail}</span>}
          </h1>
          <p className="max-w-[30em] text-[clamp(17px,1.45vw,21px)] leading-[1.55] tracking-[-0.01em] text-pretty break-keep text-ink-3">
            {siteConfig.tagline}
          </p>
        </div>

        <Link
          className="inline-flex min-h-14 items-center gap-3 rounded-full bg-accent pr-6 pl-7 text-[17px] font-semibold tracking-[-0.01em] text-accent-ink shadow-[0_14px_34px_-14px_color-mix(in_oklab,var(--color-accent)_55%,transparent),inset_0_-2px_0_rgb(0_0_0/0.16)] transition-[translate,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          href={siteConfig.cta.href}
        >
          {siteConfig.cta.label}
          <svg
            aria-hidden="true"
            className="shrink-0"
            fill="none"
            height="18"
            viewBox="0 0 24 24"
            width="18"
          >
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </Link>
      </div>
    </main>
  )
}
