// 서버 레이아웃이 읽는 상수라 'use client' 파일(color-theme.ts)과 나눠 둔다
export const STORAGE_KEY = 'chordlog-theme'

/** 저장된 테마를 첫 페인트 전에 <html data-theme>에 건다. 저장값이 없으면 OS 설정을 따른다. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}})()`
