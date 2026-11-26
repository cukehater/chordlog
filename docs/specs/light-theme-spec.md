# Chordlog 라이트 테마 구현

## 목표

현재 다크 히어로와 구도, 크기, 움직임은 같고 색과 재질만 다른 라이트 테마를 추가한다. 라이트 테마의 지판은 로즈우드 대신 메이플(밝은 나무, 검은 점 마커)이고, 배경은 따뜻한 악보 종이색이다. 다크 테마의 화면은 지금과 픽셀 단위로 같아야 한다.

## 맥락

- 기존 프로젝트: Next.js 16(App Router, TS) + Tailwind 4 + @react-three/fiber 9 + drei 10 + three 0.187
- 관련 파일: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/hero/` 아래 `Hero.tsx`, `ParallaxLayers.tsx`, `FretboardBackground.tsx`, `FretboardScene.tsx`, `fretboard-model.ts`
- 디자인 원본은 claude.ai 디자인 캔버스의 "라이트 테마: 메이플 지판" 보드다. 이 저장소에서는 열 수 없으니 필요한 값은 아래에 모두 적었다.
- `loading-transition-spec.md`(로딩·전환)를 같이 진행한다면 이 명세를 먼저 적용한다. 색 토큰 이름이 바뀌기 때문이다.

## 범위

- 포함: 색 토큰 재구성, 라이트 값 추가, 3D 지판 텍스처의 테마별 팔레트, 실행 중 테마 전환 대응
- 제외: 테마 토글 UI, 테마 선택 저장, A/B 시안(빛·초안), 새 의존성(next-themes 등)

## 가정 (확인 안 된 기본값)

- 테마는 OS 설정(`prefers-color-scheme`)을 따른다. 나중에 토글을 붙일 수 있게 `<html data-theme="light|dark">`가 있으면 그 값을 우선한다. 지금은 아무도 `data-theme`을 쓰지 않는다.

## 요구사항

### 1. 색 토큰 이름 정리

지금 토큰은 `ink`(배경), `cream`(글자)처럼 다크 기준 이름이라 라이트에서 뜻이 뒤집힌다. 역할 이름으로 바꾸고 쓰는 곳을 모두 고친다.

| 지금                      | 바꿀 이름              | dark                      | light                  |
| ------------------------- | ---------------------- | ------------------------- | ---------------------- |
| `--chordlog-ink`          | `--chordlog-bg`        | `#120D0A`                 | `#F2ECE3`              |
| `--chordlog-cream`        | `--chordlog-fg`        | `#F4ECDD`                 | `#1F1712`              |
| `--chordlog-muted`        | 그대로                 | `#CDBFA9`                 | `#6B5B4B`              |
| `--chordlog-accent`       | 그대로                 | `#F0A04B`                 | `#B4561B`              |
| `--chordlog-accent-hover` | 그대로                 | `#F1B066`                 | `#934514`              |
| `--chordlog-accent-deep`  | 그대로                 | `#825229`                 | `#64320F`              |
| `--chordlog-cta-ink`      | `--chordlog-on-accent` | `#1A120C`                 | `#FFF8EE`              |
| (새로)                    | `--chordlog-deco-far`  | `rgb(244 236 221 / 0.24)` | `rgb(31 23 18 / 0.18)` |
| (새로)                    | `--chordlog-deco-mid`  | `rgb(244 236 221 / 0.42)` | `rgb(31 23 18 / 0.32)` |

- 라이트에서 버튼 호버는 밝아지는 대신 어두워진다(`#934514`). 기존 앰버(`#F0A04B`)는 밝은 배경에서 대비가 1.82:1이라 라이트에서는 쓰지 않는다.
- Tailwind 클래스 변경: `text-cream` → `text-fg`, `outline-cream` → `outline-fg`, `text-cta-ink` → `text-on-accent`, 패럴랙스의 `text-cream/24` → `text-deco-far`, `text-cream/42` → `text-deco-mid`. `@theme inline`의 이름도 같이 바꾼다(`--color-bg`, `--color-fg`, `--color-on-accent`, `--color-deco-far`, `--color-deco-mid`).
- 배경 유틸리티 두 개는 그라데이션 전체를 변수로 받는다.
  - `--chordlog-hero-bg`
    - dark: 지금 `bg-hero` 값 그대로
    - light: `radial-gradient(ellipse 52% 60% at 70% 62%, rgb(255 206 150 / 0.42) 0%, rgb(255 206 150 / 0) 72%), radial-gradient(ellipse 120% 95% at 42% 38%, rgb(120 88 56 / 0) 55%, rgb(120 88 56 / 0.16) 100%), var(--chordlog-bg)`
  - `--chordlog-hero-fallback`
    - dark: 지금 `bg-hero-fallback` 값 그대로
    - light: `radial-gradient(ellipse 50% 56% at 70% 68%, rgb(232 160 90 / 0.35) 0%, rgb(232 160 90 / 0) 72%), linear-gradient(160deg, #F7F2EA 0%, var(--chordlog-bg) 55%, #E9E1D4 100%)`
- 로딩·전환 명세에서 쓰는 색도 토큰으로 둔다. 키프레임과 배치는 그 명세 그대로다.
  - `--chordlog-string-plain`: dark `236 229 216`, light `74 66 58` (쓰는 곳: `rgb(var(--chordlog-string-plain) / 0.8)`)
  - `--chordlog-string-wound`: dark `214 172 110`, light `160 112 52` (6번 줄은 알파 0.4)
  - `--chordlog-loader-mark`: dark `rgb(244 236 221 / 0.22)`, light `rgb(31 23 18 / 0.22)`

### 2. 테마 적용 방식(CSS)

```css
:root {
  color-scheme: dark; /* dark 토큰 */
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme='dark']) {
    color-scheme: light; /* light 토큰 */
  }
}

:root[data-theme='light'] {
  color-scheme: light; /* light 토큰 */
}
```

라이트 토큰 블록이 두 번 나오는 건 감수한다. CSS만으로 처리하므로 첫 페인트부터 맞는 테마가 나오고 깜빡임이 없다. `layout.tsx`의 `viewport.themeColor`는 미디어별 배열로 바꾼다(dark `#120d0a`, light `#f2ece3`).

### 3. 3D 지판 텍스처 팔레트

`fretboard-model.ts`에 하드코딩된 색을 `SurfacePalette` 객체로 빼고, `DARK_SURFACE`(지금 코드 값 그대로)와 `LIGHT_SURFACE`를 둔다. `createSurfaceTextures(surface)`와 `createLabelTextures(palette, fonts, surface)`가 이 값을 받는다. 프렛, 줄, 너트의 재질(MeshStandardMaterial)은 두 테마가 같다.

| 항목                              | 지금 코드(dark)                                                                                        | light                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| 지판 바탕                         | `#4a2b1e`                                                                                              | `#E4C48E`                                                                                              |
| 결 1(23px 주기, 9~10.5px)         | `rgba(20, 8, 2, 0.22)`                                                                                 | `rgba(150, 96, 36, 0.14)`                                                                              |
| 결 2(15px 주기, 5~6px / 13~15px)  | `rgba(20, 8, 2, 0.3)` / `rgba(255, 200, 150, 0.06)`                                                    | `rgba(150, 96, 36, 0.18)` / `rgba(255, 240, 210, 0.2)`                                                 |
| 폭 방향 음영(0 / 0.46 / 0.54 / 1) | `rgba(0,0,0,0.34)` / `rgba(255,214,170,0.06)` ×2 / `rgba(0,0,0,0.38)`                                  | `rgba(120,78,30,0.2)` / `rgba(255,246,228,0.12)` ×2 / `rgba(120,78,30,0.24)`                           |
| 길이 방향 조명                    | `rgba(255,196,140,0.14)` 0 → 투명 0.38 → `rgba(0,0,0,0.3)` 1                                           | `rgba(255,248,232,0.28)` 0 → 투명 0.40 → `rgba(110,70,25,0.18)` 1                                      |
| 바인딩(위 / 아래)                 | 3px `#e3d5ba` / 3px `#cdbe9f`                                                                          | 2px `rgba(90,58,24,0.55)` / 2px `rgba(90,58,24,0.65)`                                                  |
| 포지션 마커                       | 자개: `#fffaf0` 0, `#efe6d6` 0.4, `#c9bda9` 0.75, `#a39784` 1, 테두리 `rgba(0,0,0,0.25)`               | 검은 점: `#4A3A2E` 0, `#241A13` 0.45, `#120C08` 1, 테두리 `rgba(255,240,215,0.25)`                     |
| 프렛 그림자                       | `rgba(0, 0, 0, 0.45)`                                                                                  | `rgba(90, 58, 24, 0.35)`                                                                               |
| 너트 그림자                       | `rgba(0, 0, 0, 0.45)`                                                                                  | 같음                                                                                                   |
| 줄 그림자(가운데 값)              | `rgba(0, 0, 0, 0.45)`                                                                                  | `rgba(80, 50, 20, 0.32)`                                                                               |
| 운지 점 그림자                    | `#000000` 알파 0.55                                                                                    | `#502D0F` 알파 0.38                                                                                    |
| 옆면(위에서부터)                  | `#e8dcc2` 0, `#cbbb9b` 3px, `#3a2116` 3px, `#2c190f` 12px, `#74462b` 12px, `#5b3521` 0.55, `#2a170e` 1 | `#8A6436` 0, `#8A6436` 2px, `#D9B57A` 2px, `#CFA86C` 12px, `#C99D5E` 12px, `#B58A4E` 0.55, `#8E6A3C` 1 |
| 옆면 사이드 도트                  | `#efe6d3`                                                                                              | `#1F1712`                                                                                              |
| 너트 쪽 끝면                      | `#24130b` 0, `#5b3521` 0.45, `#74462b` 0.54, `#2c190f` 0.54, `#3a2116` 1                               | `#8E6A3C` 0, `#BE945A` 0.45, `#D4AF74` 0.54, `#CBA368` 0.54, `#DDBB82` 1                               |
| 떠 있는 그림자                    | 검정 0.62 / 0.3(0.55) / 0                                                                              | `rgb(92,60,28)` 0.34 / 0.14(0.55) / 0                                                                  |
| 광택 띠                           | `rgba(255,224,186)` 0 / 0.1 / 0                                                                        | `rgba(255,255,255)` 0 / 0.28 / 0                                                                       |
| 운지 점 테두리 / 숫자             | `rgba(18,13,10,0.6)` / `#1b120b`                                                                       | `rgba(255,248,236,0.85)` / `#FFF6E8`                                                                   |
| 개방현 o / 소리 안 내는 줄 x      | `rgba(244,236,221,0.8)` 둘 다                                                                          | o `rgba(31,23,18,0.7)`, x `rgba(31,23,18,0.8)`                                                         |
| 코드 이름 "C"                     | `#f4ecdd`                                                                                              | `#1F1712`                                                                                              |

운지 점 본체 그라데이션과 "x32010" 글자는 지금처럼 `--chordlog-accent`, `--chordlog-accent-deep`을 런타임에 읽는다(테마 따라 자동으로 바뀜). 읽는 변수 이름은 1번 표에 맞춘다.

### 4. 실행 중 테마 전환

- `pointer.ts` 옆에 `useColorTheme(): 'dark' | 'light'` 훅을 둔다. `useSyncExternalStore`로 `matchMedia('(prefers-color-scheme: light)')` 변경과 `<html>`의 `data-theme` 속성 변경(MutationObserver)을 구독한다. 서버 스냅샷은 `'dark'`.
- `FretboardScene`의 텍스처 `useMemo`가 테마를 의존값으로 갖게 해서, OS 테마를 바꾸면 새로고침 없이 지판이 바뀐다. 이전 텍스처는 지금처럼 정리(dispose)하고, 바꾼 뒤 `invalidate()`를 부른다.
- HTML 쪽(텍스트, 버튼, 패럴랙스, 배경)은 CSS 변수라서 따로 할 일이 없다.

## 엣지 케이스

- WebGL 폴백 배경도 테마를 따른다(`--chordlog-hero-fallback`).
- `prefers-reduced-motion`과 테마는 서로 영향이 없다.
- 테마가 바뀌는 순간 텍스처 재생성 때문에 한 프레임 비는 일이 없게, 새 텍스처를 만든 뒤 교체한다.

## 결정 사항

- 라이트 테마는 색 반전이 아니라 재료 교체다(로즈우드 → 메이플, 자개 → 검은 점). 실제 기타에 있는 조합이라 어색하지 않다.
- 의존성을 늘리지 않는다. 테마 판단은 CSS 미디어 쿼리와 작은 훅으로 끝낸다.

## 완료 기준

- [ ] `npm run build`, `npm run lint` 통과, 타입 에러 없음
- [ ] 다크 테마 1440×900 화면이 변경 전과 같다(변경 전후 스크린숏 비교)
- [ ] DevTools > Rendering > `prefers-color-scheme: light` 에뮬레이션에서 메이플 지판, 검은 점 마커, 종이색 배경, 번트 앰버 버튼이 나온다
- [ ] 에뮬레이션을 켠 채로 dark ↔ light를 바꾸면 새로고침 없이 HTML과 3D 지판이 함께 바뀐다
- [ ] 라이트 대비: 본문 `#1F1712`/배경 15.0:1, 태그라인 `#6B5B4B`/배경 5.55:1, 버튼 글자 `#FFF8EE`/`#B4561B` 4.64:1, 호버 6.42:1
- [ ] 375×812 라이트에서 가로 스크롤 없음, 타이틀과 CTA가 다 보임
- [ ] 브라우저 콘솔에 에러가 없다(R3F의 `THREE.Clock` 지원 중단 경고는 제외)

## 진행 방식

1. 코드를 쓰기 전에 바꿀 파일과 토큰 이름 변경 범위를 계획으로 먼저 보여주고 확인을 받는다.
2. 토큰 이름 변경(다크 화면 그대로인지 확인) → 라이트 CSS 값 → 3D 팔레트 → 실행 중 전환 순서로 진행한다.
3. 다음 상황에서는 멈추고 확인을 받는다: 위 목록에 없는 의존성이 필요할 때, 다크 화면이 달라질 때.
