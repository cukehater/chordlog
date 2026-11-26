# 진행 상황

## 라이트 테마 (`docs/specs/light-theme-spec.md`) — 브랜치 `feature/light-theme`

### 완료

- 테마 적용: `@theme` 값이 다크 기본값. `globals.css`의 레이어 밖 블록에서 `prefers-color-scheme: light`(단 `data-theme="dark"` 제외)와 `<html data-theme="light">`일 때 라이트 토큰으로 덮는다.
- 스펙과 달라진 점(사용자 결정)
  - 토큰 이름은 바꾸지 않았다(`bg`, `ink`~`ink-5`, `accent-ink` 유지). 스펙의 `--chordlog-*`/`cream` 이름은 지금 코드에 없다.
  - 라이트는 앱 전체에 적용. 스펙에 없는 토큰(surface·line·ink-2/4/5·상태색 등)의 라이트 값은 스펙 앵커에서 파생했다. ink-5·dim은 surface-2에서 4.50:1.
- 새 토큰: `--color-deco-far/-mid`(패럴랙스), `--color-loader-mark`, `--hero-bg`, `--hero-fallback`, `--intro-string-plain/-wound`. `themeColor`는 미디어별 배열.
- 3D 지판: `fretboard-model.ts`의 `DARK_SURFACE`/`LIGHT_SURFACE`(메이플·검은 점). `useColorTheme`(`lib/pointer.ts`)으로 OS 설정·`data-theme` 변경을 구독해 새로고침 없이 텍스처를 다시 만든다.
- 검증: 다크 1440×900 스크린숏(`/`, `/songs`, `/songs/[slug]`, `/songs/new`, `/login`)이 변경 전과 픽셀 동일. Vitest `pointer.test.ts`, Playwright `e2e/theme.spec.ts` 추가.

### 남은 일 / 알려진 점

- 라이트 `accent`(`#B4561B`, 스펙 값)를 글자색으로 쓰면 bg 대비 4.17:1이다. 작은 라벨(`text-accent`)이 AA 4.5:1에 못 미친다. 스펙 값이라 그대로 뒀다.
- 헤더 테마 버튼(`widgets/site-header/ui/theme-toggle.tsx`)으로 dark↔light 전환. 선택은 localStorage `chordlog-theme`에 저장하고 `THEME_SCRIPT`가 첫 페인트 전에 `data-theme`으로 건다. 테마 로직은 `shared/lib/color-theme`로 옮겼다. 저장값을 지워 OS 설정으로 돌아가는 UI는 없다.
- 랜딩(`/`)에는 헤더가 없어 버튼이 없다.
- 커밋 안 된 `page-grid` 작업(13파일)이 같은 작업 트리에 섞여 있다. 커밋할 때 나눠야 한다.
