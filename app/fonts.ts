import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans_KR } from "next/font/google";

/** 타이틀과 코드 심볼. opsz 축을 켜서 큰 크기에서 디스플레이 형태로 바뀌게 한다. */
export const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

/** 본문·제목·악보 전체. 한글 글리프가 커서 preload는 끈다. */
export const plexSansKr = IBM_Plex_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-plex-kr",
  display: "swap",
  preload: false,
});

/** TAB, 튜닝 글자, 운지 번호, 코드 표기(x32010). */
export const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});
