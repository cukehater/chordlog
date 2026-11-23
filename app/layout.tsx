import type { Metadata, Viewport } from 'next';
import { siteConfig } from '@/lib/site';
import { fraunces, plexMono, plexSansKr } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.tagline,
};

export const viewport: Viewport = {
  themeColor: '#120D0A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${fraunces.variable} ${plexSansKr.variable} ${plexMono.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
