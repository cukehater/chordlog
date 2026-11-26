# Chordlog 로딩 화면과 히어로 전환 구현

## 목표

3D 지판(R3F 캔버스)이 한 박자 늦게 그려지는 동안 로딩 화면을 보여주고, 장면이 준비되면 로딩 화면의 요소가 그대로 히어로로 이어지는 전환을 만든다. 로딩 화면의 워드마크는 히어로 타이틀(h1)로 커지며 이동하고, 로딩 화면의 기타 줄 6가닥은 3D 지판의 줄 위치로 날아가 겹친 뒤 사라진다.

## 맥락

- 기존 프로젝트: Next.js 16(App Router, TS) + Tailwind 4 + @react-three/fiber 9 + drei 10 + three 0.187
- 관련 파일: `src/components/hero/` 아래 `Hero.tsx`(서버), `FretboardBackground.tsx`, `FretboardScene.tsx`, `fretboard-model.ts`, `ParallaxLayers.tsx`, `pointer.ts`, 그리고 `src/app/globals.css`, `src/app/layout.tsx`
- 디자인 원본은 claude.ai 디자인 캔버스에 있고 이 저장소에서는 열 수 없다. 필요한 수치는 이 문서에 모두 적었다.

## 범위

- 포함: 로딩 화면, 로딩에서 히어로로의 전환, 전환 중 입력 차단, reduced-motion과 폴백 처리
- 제외: 히어로 디자인 변경, 새 페이지, 사운드, 애니메이션 라이브러리 추가

## 요구사항

### 1. 언제 로딩 화면을 보여주나

1. 첫 페인트부터 히어로 콘텐츠(h1 제외한 태그라인, CTA, 패럴랙스, 3D 캔버스)는 숨긴 상태로 시작한다. h1은 로딩 화면의 워드마크 역할을 하므로 숨기지 않고 로딩 위치에 둔다.
2. 장면이 150ms 안에 준비되면 로딩 화면 없이 바로 "빠른 경로"(아래 4-3)로 간다. 150ms가 지나도 준비가 안 되면 로딩 화면을 띄운다.
3. 로딩 화면이 한 번 떴으면 최소 900ms는 유지한다(줄이 5번에서 1번까지 한 번 울리는 시간). 깜빡임처럼 보이지 않게 하기 위해서다.
4. "준비"는 `FretboardScene`의 첫 프레임이 웹폰트가 반영된 텍스처로 그려진 시점이다. R3F 캔버스가 만들어진 시점이 아니다.
5. 8초가 지나도 준비 신호가 없으면 그냥 전환을 시작한다(안전장치).
6. 첫 페인트 전에 숨김 상태를 걸어야 깜빡임이 없다. `layout.tsx`의 `<head>`에 인라인 스크립트로 `<html>`에 `data-intro="pending"`을 붙이고, CSS에서 이 속성으로 숨긴다. JS가 꺼져 있으면 속성이 붙지 않으니 히어로가 그대로 보인다.

### 2. 로딩 화면 구성

- 배경: 히어로와 같은 `bg-hero`. 로딩 화면이 걷힐 때 배경은 바뀌지 않아야 한다.
- 세로 가운데 정렬된 세 덩어리. 위에서부터 워드마크(실제 h1), 줄 상자, 상태 문구.
  - `fs0 = clamp(40px, 10vw, 56px)`, `total = fs0 + 148px`, `top0 = 50vh - total/2`
  - 워드마크 중심 y = `top0 + fs0/2`
  - 줄 상자: 220×72px, 가로 가운데, top = `top0 + fs0 + 28px`
  - 상태 문구 top = 줄 상자 top + 100px, 가로 가운데
- 줄 상자 안 (위에서부터 1번 줄 e ~ 6번 줄 E)

| 줄  | 중심 y(px) | 두께(px) | 색                       | 울림 지연               |
| --- | ---------- | -------- | ------------------------ | ----------------------- |
| e   | 8          | 1        | `rgba(236,229,216,0.8)`  | 0.4s                    |
| B   | 19         | 1.2      | `rgba(236,229,216,0.8)`  | 0.3s                    |
| G   | 30         | 1.5      | `rgba(214,172,110,0.85)` | 0.2s                    |
| D   | 41         | 1.8      | `rgba(214,172,110,0.85)` | 0.1s                    |
| A   | 52         | 2.1      | `rgba(214,172,110,0.85)` | 0s                      |
| E   | 63         | 2.4      | `rgba(214,172,110,0.4)`  | 울리지 않음(C 코드의 x) |

- 각 줄(E 제외)에 세 겹: 선 자체(`cl-jitter`), 떨림 잔상(높이 9px 타원, 줄 색 0 → 0.5 → 0 세로 그라데이션, `cl-vib`), 빛 띠(64×3px, `transparent → color-mix(in oklch, var(--chordlog-accent) 80%, #FFF6E6) 60% → transparent`, `cl-sweep`). 셋 다 `2.4s infinite both`, 지연은 표 값.
- 줄 상자 양 끝에 너트·새들 표시: 1×64px, top 4px, `rgba(244,236,221,0.22)`
- 상태 문구: "코드 잡는 중" + 점 세 개(`cl-ellipsis 1.4s linear infinite both`, 지연 0 / 0.2 / 0.4s). 14px, weight 500, letter-spacing 0.02em, `#CDBFA9`.
- 접근성: 상태 문구 컨테이너는 `role="status"`, 스크린리더용 숨김 텍스트 "페이지를 불러오는 중입니다". 보이는 문구와 점은 `aria-hidden`. 전환 중에는 `<main aria-busy="true">`.

### 3. 키프레임 (globals.css에 그대로 넣는다)

```css
@keyframes cl-vib {
  0% {
    transform: scaleY(0);
    opacity: 0;
  }
  2% {
    transform: scaleY(1);
    opacity: 0.9;
  }
  5% {
    transform: scaleY(0.5);
    opacity: 0.85;
  }
  8% {
    transform: scaleY(0.85);
    opacity: 0.8;
  }
  12% {
    transform: scaleY(0.42);
    opacity: 0.7;
  }
  16% {
    transform: scaleY(0.6);
    opacity: 0.6;
  }
  22% {
    transform: scaleY(0.3);
    opacity: 0.45;
  }
  30% {
    transform: scaleY(0.34);
    opacity: 0.32;
  }
  42% {
    transform: scaleY(0.12);
    opacity: 0.15;
  }
  55%,
  100% {
    transform: scaleY(0);
    opacity: 0;
  }
}
@keyframes cl-jitter {
  0% {
    transform: translateY(0);
  }
  2% {
    transform: translateY(-1.2px);
  }
  4% {
    transform: translateY(1px);
  }
  6% {
    transform: translateY(-0.8px);
  }
  8.5% {
    transform: translateY(0.6px);
  }
  11% {
    transform: translateY(-0.45px);
  }
  14% {
    transform: translateY(0.3px);
  }
  18% {
    transform: translateY(-0.18px);
  }
  24% {
    transform: translateY(0.08px);
  }
  30%,
  100% {
    transform: translateY(0);
  }
}
@keyframes cl-sweep {
  0% {
    transform: translateX(-64px);
    opacity: 0;
  }
  3% {
    opacity: 1;
  }
  30% {
    transform: translateX(232px);
    opacity: 0;
  }
  100% {
    transform: translateX(232px);
    opacity: 0;
  }
}
@keyframes cl-ellipsis {
  0%,
  15% {
    opacity: 0.25;
  }
  35% {
    opacity: 1;
  }
  65%,
  100% {
    opacity: 0.25;
  }
}
```

빛 띠는 줄 상자 밖으로 나가지 않게 잘라야 한다. 줄 래퍼에 `clip-path: inset(-6px 0)`을 주면 세로 잔상은 살고 가로만 잘린다.

### 4. 전환 타임라인

M = 전환 시작 시점(로딩 화면이 걷히기 시작하는 순간). 이징 `E1 = cubic-bezier(0.65, 0, 0.2, 1)`, `E2 = cubic-bezier(0.2, 0.8, 0.2, 1)`, `E3 = cubic-bezier(0.34, 1.56, 0.64, 1)`.

| 시점     | 단계   | 내용                                                                                                                                                                                                                                      |
| -------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M        | morph  | 상태 문구와 너트·새들 표시 opacity 0(200ms). 줄 애니메이션 정지. h1이 로딩 위치에서 제자리로(transform 1100ms E1). 줄 6가닥이 지판 줄 위치로(transform·width 1000ms E1, 6번 줄부터 50ms씩 지연: 지연 = (5 - 인덱스) × 50ms, 인덱스 0이 e) |
| M+900ms  | reveal | 3D 캔버스 opacity 0 → 1(600ms ease)                                                                                                                                                                                                       |
| M+1300ms | text   | 겹쳐 있던 줄 opacity 0(400ms). 태그라인 opacity 500ms + translateY 12px → 0 600ms E2, 지연 80ms. CTA 같은 값, 지연 200ms. 패럴랙스 먼·중간·가까운 레이어 opacity 700ms, 지연 0 / 100 / 200ms                                              |
| M+1700ms | strum  | 운지 점 1, 2, 3이 scale 0.4 → 1(420ms E3) + opacity 0 → 1(200ms), 지연 0 / 120 / 240ms. "C x32010" 라벨 opacity 500ms, 지연 360ms                                                                                                         |
| M+2500ms | done   | 마우스 기울기·패럴랙스 활성화. `aria-busy` 해제, 상태 문구 비움                                                                                                                                                                           |

#### 4-1. h1 이동(FLIP)

h1은 원래 레이아웃 위치에 두고 transform만 바꾼다. 로딩 단계 transform:

```
transform-origin: 50% 50%;
transform: translate(calc(50vw - padL - 50%), calc(wordY - padT - 50%)) scale(fs0 / fs);
```

`padL = clamp(24px, 7vw, 112px)`, `padT = clamp(88px, 24dvh, 240px)`(Hero의 padding과 같은 값), `fs = clamp(60px, 11vw, 176px)`. translate의 `-50%`는 h1 자기 크기 기준이라 글자 폭을 재지 않아도 정확히 가운데로 간다. morph에서 `transform: none`으로 바꾼다.

#### 4-2. 줄이 지판 줄 위에 내려앉는 위치

- 착지 지점은 3D 장면에서 구한다. 마우스 기울기 0인 기본 자세에서 각 줄의 양 끝점(지판 좌표 x = `STRING_START`(6)과 `BOARD_LENGTH`(1300), y = 각 줄 y, z = 9)을 `group.localToWorld`로 월드 좌표로 바꾸고 `vector.project(camera)`로 화면 px을 얻는다. 카메라에 `setViewOffset`이 걸려 있으니 반드시 투영 행렬을 거쳐서 계산한다.
  - 화면 x = `(ndc.x + 1) / 2 × width`, 화면 y = `(1 - ndc.y) / 2 × height`
- HTML 줄 래퍼(`position: absolute; left: 0; top: 0; transform-origin: 0 50%`)의 착지 값: `transform: translate(x1, y1 - 두께/2) rotate(atan2(y2 - y1, x2 - x1))`, `width: hypot(x2 - x1, y2 - y1)`. 로딩 위치는 `translate(50vw - 110px, 줄 중심 y - 두께/2) rotate(0)`, `width: 220px`.
- 검증값: 1440×900에서 A줄(인덱스 4) 시작점이 약 (729, 757), 각도 약 −29.1°, 길이 약 1122px. 375×812에서도 지판 줄과 겹쳐야 한다.
- 이 좌표는 `FretboardScene`이 계산해서 아래 스토어로 넘긴다. 창 크기가 바뀌면 다시 계산한다.

#### 4-3. 빠른 경로(로딩 화면을 띄우지 않은 경우)

h1은 이미 제자리다. 줄 오버레이 없이 reveal(캔버스 600ms 페이드) → text → strum → done 순서만 같은 간격으로 진행한다.

#### 4-4. 3D 장면 안의 애니메이션

운지 점과 라벨은 R3F 메시라서 CSS로 못 움직인다. `useFrame`에서 strum 시작 시각 기준으로 scale·opacity를 계산하고, 진행 중에는 `invalidate()`를 계속 부른다(`frameloop="demand"` 유지). E3 이징은 같은 베지어를 JS로 구현하거나 `1 + c3·(t−1)³ + c1·(t−1)²`(c1 = 1.70158, c3 = c1 + 1) easeOutBack으로 근사한다.

### 5. 상태 공유

`Hero`는 서버 컴포넌트이고 `FretboardBackground`와 `ParallaxLayers`는 형제 클라이언트 컴포넌트다. 새 의존성 없이 모듈 스토어 하나(`src/components/hero/intro-store.ts`, `subscribe`/`getSnapshot` + `useSyncExternalStore`)로 단계, 시작 시각, 줄 착지 좌표, 준비 여부를 공유한다. 로딩 화면 마크업과 타임라인 진행은 클라이언트 컴포넌트 하나(`HeroIntro.tsx`)가 맡는다.

## 엣지 케이스

- `prefers-reduced-motion: reduce`: 로딩 화면은 정지 상태(줄 떨림, 빛 띠, 점 깜빡임 없음). 전환은 날아가는 움직임 없이 로딩 요소와 h1을 200~250ms 페이드아웃 → h1 위치를 즉시 바꾸고 → 히어로 전체를 300ms 페이드인. 운지 점 튕김도 없다.
- WebGL2 미지원·컨텍스트 실패: 착지할 3D 줄이 없으니 morph의 줄 이동은 생략하고 줄은 페이드아웃, 정적 배경은 페이드인. h1 이동은 그대로 한다.
- 터치 기기: 전환은 같다. done 이후에도 기울기는 지금처럼 꺼져 있다.
- 전환 중 창 크기 변경: 착지 좌표를 다시 받아 transition이 새 값으로 이어지게 둔다.
- 전환 중에는 CTA가 보이지 않으니 `pointer-events: none`과 `tabIndex={-1}`로 막고, text 단계부터 풀어준다.
- 탭이 백그라운드일 때 시작하면 타이머 대신 `document.visibilityState`가 visible이 된 뒤 진행한다.

## 결정 사항

- 애니메이션 라이브러리는 쓰지 않는다. CSS transition·keyframes + rAF(R3F useFrame)로 구현한다.
- 로딩 화면 워드마크는 복제본이 아니라 실제 h1이다. 그래야 두 화면이 하나로 이어진다.
- 숨김 상태는 첫 페인트 전 인라인 스크립트로 건다. JS 실패 시 히어로가 그대로 보이게 하기 위해서다.

## 완료 기준

- [ ] `npm run build`, `npm run lint` 통과, 타입 에러 없음
- [ ] DevTools에서 Network "Slow 4G" + CPU 6x 감속으로 열면 로딩 화면이 보이고, 위 타임라인대로 전환된다
- [ ] 감속 없이 열면 로딩 화면이 번쩍이지 않는다(150ms 규칙)
- [ ] 1440×900, 375×812에서 날아간 줄이 3D 지판 줄과 2px 이내로 겹친 뒤 사라진다
- [ ] reduced-motion 에뮬레이션에서 날아가는 움직임 없이 페이드로만 바뀐다
- [ ] WebGL을 끈 브라우저(`--disable-webgl`)에서도 로딩 → 정적 배경으로 끝까지 진행된다
- [ ] JS를 끄면 로딩 화면 없이 히어로 텍스트와 CTA가 보인다
- [ ] 브라우저 콘솔에 에러가 없다(R3F의 `THREE.Clock` 지원 중단 경고는 제외)

## 진행 방식

1. 코드를 쓰기 전에 파일 구성과 단계 흐름을 계획으로 먼저 보여주고 확인을 받는다.
2. 로딩 화면 → 착지 좌표 계산 → 타임라인 → 3D 안 애니메이션 → 엣지 케이스 순서로 진행한다.
3. 다음 상황에서는 멈추고 확인을 받는다: 위 목록에 없는 의존성이 필요할 때, 기존 히어로의 생김새를 바꿔야 할 때.
