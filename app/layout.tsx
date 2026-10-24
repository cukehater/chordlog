import type { Metadata } from 'next';
import { Noto_Sans_KR, Noto_Sans_Mono } from 'next/font/google';
import './globals.css';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
});
const notoSansMono = Noto_Sans_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-noto-sans-mono',
});

export const metadata: Metadata = {
  title: '코드집',
  description: '기타 코드 악보 아카이브',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${notoSansMono.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
