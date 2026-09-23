import type { Metadata } from 'next';
import { Hahmlet, Gothic_A1, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const hahmlet = Hahmlet({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-hahmlet',
});
const gothicA1 = Gothic_A1({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-gothic-a1',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: '코드집',
  description: '기타 코드 악보 아카이브',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${hahmlet.variable} ${gothicA1.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
