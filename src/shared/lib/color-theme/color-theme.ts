'use client'

import { useSyncExternalStore } from 'react'

import { STORAGE_KEY } from './theme-script'

export type ColorThemeType = 'dark' | 'light'

const LIGHT_QUERY = '(prefers-color-scheme: light)'

/** <html data-theme>이 있으면 그 값, 없으면 OS 설정. globals.css의 테마 선택자와 같은 규칙이다. */
export const resolveColorTheme = (
  dataTheme: string | undefined,
  prefersLight: boolean,
): ColorThemeType => {
  if (dataTheme === 'light' || dataTheme === 'dark') return dataTheme
  return prefersLight ? 'light' : 'dark'
}

const currentColorTheme = () =>
  resolveColorTheme(document.documentElement.dataset.theme, window.matchMedia(LIGHT_QUERY).matches)

const subscribeColorTheme = (onChange: () => void) => {
  const query = window.matchMedia(LIGHT_QUERY)
  query.addEventListener('change', onChange)
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] })
  return () => {
    query.removeEventListener('change', onChange)
    observer.disconnect()
  }
}

/** 지금 적용된 색 테마. 서버 렌더링 중에는 'dark'. */
export const useColorTheme = () => {
  return useSyncExternalStore(subscribeColorTheme, currentColorTheme, (): ColorThemeType => 'dark')
}

/** 지금 테마를 반대로 바꾸고 저장한다. 저장을 못 해도(사생활 보호 모드 등) 이 페이지에서는 바뀐다. */
export const toggleColorTheme = () => {
  const next: ColorThemeType = currentColorTheme() === 'light' ? 'dark' : 'light'
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // 저장 실패는 무시한다. 다음 방문은 OS 설정을 따른다
  }
}
