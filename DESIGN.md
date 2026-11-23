---
name: Chordlog
description: 어두운 로즈우드 무대 위의 앰버 코드. 랜딩의 3D 지판과 같은 톤으로 맞춘 개인 기타 악보 아카이브
colors:
  accent: "#F0A04B"
  accent-hover: "#F1B066"
  accent-deep: "#825229"
  accent-soft: "#3A2716"
  accent-mute: "#C9A183"
  accent-ink: "#1A120C"
  bg: "#120D0A"
  surface: "#17110D"
  surface-2: "#1F1712"
  surface-3: "#241B15"
  line: "#2E241C"
  line-strong: "#3E3126"
  ink: "#F4ECDD"
  ink-2: "#E6DAC6"
  ink-3: "#CDBFA9"
  ink-4: "#B3A48D"
  ink-5: "#9A8B75"
  faint: "#6B5D4D"
  fret-nut: "#8A7A66"
  done: "#6CC89A"
  done-soft: "#183326"
  danger: "#FF7A66"
  danger-text: "#FF9A8E"
typography:
  wordmark:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "22px"
    fontWeight: 600
    letterSpacing: "-0.03em"
  landing-title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(60px, 11vw, 176px)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "IBM Plex Sans KR, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "IBM Plex Sans KR, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
  sheet-lyric:
    fontFamily: "IBM Plex Sans KR, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  sheet-chord:
    fontFamily: "IBM Plex Sans KR, system-ui, sans-serif"
    fontSize: "1em"
    fontWeight: 700
    lineHeight: 1.5
  section-label:
    fontFamily: "IBM Plex Sans KR, system-ui, sans-serif"
    fontSize: "0.76em"
    fontWeight: 700
    letterSpacing: "0.02em"
  body:
    fontFamily: "IBM Plex Sans KR, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Sans KR, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  caption:
    fontFamily: "IBM Plex Sans KR, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  tab:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.66em"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "8px"
  xl: "10px"
  dock: "16px"
  pill: "999px"
spacing:
  gap-sm: "8px"
  gap-md: "12px"
  card: "16px"
  page-top: "28px"
  page-x: "40px"
  sheet-gutter: "60px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.accent-ink}"
  button-landing-cta:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px 0 28px"
    height: "56px"
  button-outline:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.surface-2}"
  toggle-on:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.md}"
    height: "36px"
  chip-meta:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "28px"
  chip-status-practicing:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "28px"
  chip-status-done:
    backgroundColor: "{colors.done-soft}"
    textColor: "{colors.done}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "28px"
  card:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
  tab-block:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    typography: "{typography.tab}"
    rounded: "{rounded.lg}"
    padding: "12px 14px"
  mobile-dock:
    backgroundColor: "{colors.surface-3}"
    rounded: "{rounded.dock}"
    padding: "8px"
  dock-button:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.xl}"
    size: "44px"
---

# Design System: Chordlog

## Overview

**Creative North Star: "어두운 무대 위의 앰버 코드"**

Chordlog(가칭)는 랜딩의 3D 지판과 같은 세계 안에 있다. 로즈우드처럼 어두운 갈색 바탕, 크림색 가사, 그 위에 굵은 앰버 코드. 조명을 낮춘 연습실에서 모니터를 봐도 눈부시지 않고, 코드만 따뜻하게 떠오른다.

2026-11-23 결정으로 이전의 라이트 표준(흰 바탕 + 파랑)을 접고 랜딩 산출물(`docs/design/landing/`)의 톤을 앱 전체 기준으로 삼았다. 랜딩은 무대(그라데이션 조명, 3D 장면, 장식 레이어)를 쓰고, 앱 화면은 같은 팔레트를 평면으로 쓴다. 컨트롤은 표준 테두리 버튼·스테퍼·세그먼트 그대로다.

밀도는 중간이다. 툴바는 한 줄, 카드는 16px 안쪽 여백, 악보는 줄 사이 12px. 깊이는 갈색 명도 단계(bg → surface-2 → surface-3)와 1px 선으로 만든다.

**Key Characteristics:**
- 어두운 단일 테마, 앰버 하나만 액센트
- 한글은 IBM Plex Sans KR 한 가족. Fraunces는 워드마크·랜딩 타이틀·랜딩 장식 코드 심볼에만, IBM Plex Mono는 TAB·튜닝 글자에만
- 코드는 가사와 같은 크기의 굵은 앰버
- 앱 화면은 평면(1px 선과 면), 무대 연출은 랜딩에만
- 표준 테두리 컨트롤, 36px(데스크톱) / 44px(모바일) 높이

## Colors

로즈우드 바탕과 크림 잉크 위에 앰버 하나가 "지금 연주할 것"과 "켜진 것"을 가리킨다. 랜딩 원본값(bg `#120D0A`, ink `#F4ECDD`, ink-3 `#CDBFA9`, accent `#F0A04B`)이 기준축이고 나머지 단계는 그 사이를 보간했다.

### Primary
- **앰버** (accent): 코드 글자, 주요 버튼(새 곡, 연주 시작, 랜딩 CTA), 켜진 토글·선택된 세그먼트, 툴바 스테퍼의 현재 값, 강세 스트로크, 카포 바, 링크, 포커스 링, 워드마크의 "log".
- **밝은 앰버** (accent-hover): 주요 버튼과 링크의 hover. 어두운 바탕이라 hover는 어두워지지 않고 밝아진다.
- **깊은 앰버** (accent-deep): 3D 운지 점의 그림자 쪽 색. UI 글자나 면에는 쓰지 않는다(바탕과 대비가 안 나온다).
- **앰버 틴트** (accent-soft): "연습중" 칩 바탕, 텍스트 선택 영역, 메트로놈 박 점의 링.
- **흐린 앰버** (accent-mute): 배지 글자.
- **앰버 위 글자** (accent-ink): 앰버 면 위의 어두운 글자.

### Neutral
- **무대** (bg): 페이지·카드·툴바·컨트롤의 바탕. 카드도 바탕색이며 테두리로만 구분한다.
- **한 단계 밝은 면** (surface-2): 메타 칩, TAB 블록, 컨트롤 hover, 독 버튼 바탕.
- **떠 있는 면** (surface-3): 모바일 독.
- **선** (line): 모든 1px 구획선.
- **진한 선** (line-strong): 독 테두리와 독 안 구분선, 꺼진 메트로놈 박 점, 프렛선.
- **잉크 1–5** (ink … ink-5): 제목(ink) → 가사·칩 값(ink-2) → 컨트롤 글자·메모·랜딩 태그라인(ink-3) → 카드 설명(ink-4) → 보조 정보·섹션 라벨(ink-5). ink-5까지 bg와 surface-2 위에서 4.5:1 이상이고 `lib/__tests__/tokens.test.ts`가 이를 검사한다.
- **희미한 갈색** (faint): 장식 전용. 읽어야 하는 글자에는 쓰지 않는다.
- **프렛 너트** (fret-nut): 카포 다이어그램의 너트.

### 상태색
- **완료 초록** (done, done-soft): "완료" 상태 점과 칩(어두운 초록 바탕 + done 글자).
- **위험 빨강** (danger, danger-text, danger-ink): 편집기 파싱 오류 줄과 문구. danger 면 위 글자는 danger-ink(어두운 색).

### Named Rules
**The One Amber Rule.** 액센트는 앰버 하나뿐이다. 두 번째 액센트를 들이지 않는다. 초록·빨강은 상태를 말할 때만 쓴다.

**The Amber Means Chord-or-On Rule.** 앱 화면에서 앰버는 코드 글자이거나 켜진/주요 조작이다. 예외는 워드마크의 "log"와 랜딩의 장식 레이어뿐이다.

## Typography

**Display Font:** Fraunces (opsz 축, normal/italic, Georgia 폴백). 라틴 전용이라 `--font-display`의 한글은 IBM Plex Sans KR로 떨어진다.
**Body Font:** IBM Plex Sans KR. 400/500/600/700
**Mono Font:** IBM Plex Mono. 400/500/600, TAB·튜닝 글자·3D 운지 번호 전용

### Hierarchy
- **Wordmark** (Fraunces 600, 22px, -0.03em): "Chord" + 이탤릭 500 앰버 "log". 이름과 강조 끝부분은 `lib/site.ts`의 `name`, `nameAccent`.
- **Landing title** (Fraunces 600, clamp(60px, 11vw, 176px), 0.9, -0.035em): 랜딩 h1. 워드마크와 같은 분할.
- **Headline** (700, 28px, 1.25, -0.01em): 곡 제목 h1.
- **Title** (700, 14px): 카드 제목.
- **Sheet** (가사 400 / 코드 700, 기본 18px, 1.5): 악보 컨테이너의 글자 크기 하나만 바꾸고 안쪽은 em으로 따라간다.
- **Section label** (700, 0.76em, 0.02em, ink-5): "[Verse 1]".
- **Body** (400, 13px, 1.6), **Label** (500, 13px), **Caption** (400, 12px).
- **TAB** (IBM Plex Mono 400, 0.66em, 1.6).

### Named Rules
**The One Korean Family Rule.** 한글이 들어가는 모든 글자는 IBM Plex Sans KR. Fraunces는 라틴 표시용(워드마크, 랜딩 타이틀, 랜딩 장식 코드 심볼)에만 쓰고, 악보 코드에는 쓰지 않는다.

**The Same-Size Chord Rule.** 코드는 가사와 같은 크기(1em)의 굵은 앰버다. 작게 줄이거나 다른 가족으로 바꾸지 않는다.

## Layout

- **랜딩 `/`:** 스크롤 없는 한 화면 히어로. 왼쪽에 타이틀·태그라인·CTA(서버 렌더), 오른쪽에 3D 지판(`components/landing/FretboardScene.tsx`), 그 사이에 SVG 장식 레이어 3겹. CTA는 `/songs`.
- **페이지 컨테이너:** 최대 폭 1360px, 좌우 40px 여백, 가운데 정렬.
- **세로 흐름(데스크톱):** 60px 상단 내비 → 곡 머리 → 툴바(56px) → 본문. 본문만 스크롤한다.
- **본문:** 악보(가변) + 300px 카드 열. 둘 사이 32px, 1100px 이상에서 60px.
- **악보 리듬:** 블록 사이 12px, 섹션 라벨 위 24px 아래 10px. 단 간격 60px, 단 사이 1px 세로선.
- **모바일(768px 미만):** 곡 화면 자체 상단 바, 하단에 떠 있는 독(좌우 8px, 아래 24px). 악보는 독 높이만큼(150px) 아래 여백.

## Elevation & Depth

앱 화면은 평면이다. 페이지·카드·툴바는 그림자 없이 1px 선과 명도 단계로 구분한다.

### Shadow Vocabulary
- **독 그림자** (`0 14px 34px rgba(0, 0, 0, 0.6)`): 모바일 하단 독.
- **FAB 그림자** (`0 10px 30px rgba(0, 0, 0, 0.55)`): 모바일 새 곡 버튼.
- **랜딩 CTA**: 앰버 번짐 그림자 + 안쪽 아래 2px 어두운 선.

### Named Rules
**The Stage-Only-On-Landing Rule.** 그라데이션 조명, 비네트, 3D 장면, 블러 장식, CTA 번짐 그림자는 랜딩(`components/landing/`, `bg-hero`, `bg-hero-fallback`)에만 있다. 앱 화면의 카드·버튼·칩·툴바에는 그림자와 그라데이션을 주지 않는다. 3D 텍스처의 나무·금속 색은 소재색이라 토큰 대상이 아니다.

## Shapes

작은 것일수록 작은 반경: 배지 4px → 칩 6px → 버튼·스테퍼·세그먼트·TAB 블록 8px → 카드·독 버튼 10px → 모바일 독 16px → 랜딩 CTA pill. 점만 완전한 원이다. 테두리는 언제나 1px 선. 켜진 상태는 테두리까지 앰버로 채운다.

## Components

### Buttons
- **Primary:** 앰버 면 + accent-ink 글자, 8px 반경, 36px, 14px 500. hover는 밝은 앰버.
- **Landing CTA:** pill, 56px, 17px 600, 오른쪽 화살표. hover에 2px 떠오름(reduced-motion이면 끔).
- **Outline:** 바탕 면 + 1px 선 + ink-3. hover는 surface-2. 아이콘 전용은 36×36에 `aria-label` 필수.
- **Disabled:** 불투명도 40%. **Focus:** 전역 2px 앰버 외곽선, 2px 띄움.

### Toggles · Stepper · Chips
- **ToolToggle / Segmented:** 켜지면 앰버 면 + accent-ink 글자. `aria-pressed`.
- **Stepper:** 가운데 값은 13px 700 앰버. 독에서는 dock-well 우물 안 44×44 버튼.
- **메타 칩:** 28px, surface-2, 6px. 이름표 ink-5, 값 ink-2 700.
- **상태 칩:** 연습중(앰버 틴트 + 앰버), 완료(초록 틴트 + 초록), 보관(surface-2 + ink-5).

### 악보 (Signature)
- **코드 줄:** 코드와 가사 조각이 세로로 붙은 쌍. 코드는 굵은 앰버, 가사는 lyric, 행간 1.5.
- **TAB 블록:** surface-2, 8px 반경, 머리 줄에 작은 앰버 "TAB". 본문은 IBM Plex Mono.
- **스트러밍 패턴:** 강세는 앰버 굵게 + 아래 10×2px 앰버 막대. 범례 "↓ 다운 · ↑ 업 · 앰버색은 강세".
- **카포 카드:** 너트 fret-nut, 프렛선 진한 선, 앰버 둥근 카포 바.

### 모바일 독
surface-3 면, 진한 선 테두리, 16px 반경, 독 그림자. 버튼 44×44, 켜지면 앰버 면.

## Do's and Don'ts

### Do:
- **Do** 새 화면도 어두운 바탕 + 크림 잉크 + 앰버 하나로 만든다. `@theme` 변수(`--color-*`, `--radius-*`)만 쓰고 새 hex를 만들지 않는다.
- **Do** 토큰 값을 바꾸면 `pnpm test`의 대비 검사를 통과시킨다.
- **Do** 모바일 터치 타깃 44px 이상, 아이콘 전용 버튼에 `aria-label`.
- **Do** 서비스 이름은 `lib/site.ts`에서만 바꾼다.

### Don't:
- **Don't** 두 번째 액센트(파랑 등)를 들이지 않는다.
- **Don't** 앱 화면에 랜딩식 무대 연출(그라데이션, 블러, 번짐 그림자)을 가져오지 않는다.
- **Don't** hover를 accent-deep으로 어둡게 하지 않는다. 어두운 바탕에서는 accent-hover로 밝힌다.
- **Don't** Fraunces로 한글이나 악보 코드를 쓰지 않는다.
- **Don't** faint를 읽어야 하는 글자에 쓰지 않는다.
