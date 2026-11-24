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

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html className={`${fraunces.variable} ${plexSansKr.variable} ${plexMono.variable}`} lang="ko">
      <body className="bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  )
}
