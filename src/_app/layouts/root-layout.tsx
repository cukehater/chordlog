import '../styles/globals.css'

import type { Metadata, Viewport } from 'next'

import { fraunces, plexMono, plexSansKr, siteConfig } from '@/shared/config'

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.tagline,
}

export const viewport: Viewport = {
  themeColor: '#120D0A',
}

/**
 * 랜딩 인트로의 숨김 상태를 첫 페인트 전에 건다. JS가 꺼져 있으면 붙지 않아 히어로가 그대로 보인다.
 * 축소 비율 식은 _pages/landing/lib/intro-timeline.ts의 introTitleScale과 같다.
 */
const INTRO_SCRIPT = `(function(){if(location.pathname!=='/')return;var d=document.documentElement,w=innerWidth,c=function(v,a,b){return Math.min(b,Math.max(a,v))};d.dataset.intro='pending';d.style.setProperty('--intro-scale',String(c(w*0.1,40,56)/c(w*0.11,60,176)))})()`

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      suppressHydrationWarning
      className={`${fraunces.variable} ${plexSansKr.variable} ${plexMono.variable}`}
      lang="ko"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body className="bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  )
}
