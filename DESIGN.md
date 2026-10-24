---
name: 코드집
description: 흰 종이 위의 파란 코드 — 코드 악보 서비스의 표준 화면을 장난 없이 최고 수준으로 다듬은 개인 기타 악보 아카이브
colors:
  accent: "#2563EB"
  accent-deep: "#1E40AF"
  accent-soft: "#DBEAFE"
  accent-ink: "#FFFFFF"
  bg: "#FFFFFF"
  surface-2: "#F3F4F6"
  line: "#E5E7EB"
  line-strong: "#D1D5DB"
  ink: "#111827"
  ink-2: "#1F2937"
  ink-3: "#374151"
  ink-4: "#4B5563"
  ink-5: "#6B7280"
  faint: "#9CA3AF"
  fret-nut: "#374151"
  done: "#059669"
  done-soft: "#D1FAE5"
  done-deep: "#065F46"
  danger: "#DC2626"
  danger-text: "#B91C1C"
typography:
  wordmark:
    fontFamily: "Noto Sans KR, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Noto Sans KR, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Noto Sans KR, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
  sheet-lyric:
    fontFamily: "Noto Sans KR, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  sheet-chord:
    fontFamily: "Noto Sans KR, system-ui, sans-serif"
    fontSize: "1em"
    fontWeight: 700
    lineHeight: 1.5
  section-label:
    fontFamily: "Noto Sans KR, system-ui, sans-serif"
    fontSize: "0.76em"
    fontWeight: 700
    letterSpacing: "0.02em"
  body:
    fontFamily: "Noto Sans KR, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Noto Sans KR, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  caption:
    fontFamily: "Noto Sans KR, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  tab:
    fontFamily: "Noto Sans Mono, ui-monospace, monospace"
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
    backgroundColor: "{colors.accent-deep}"
    textColor: "{colors.accent-ink}"
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
    textColor: "{colors.accent-deep}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "28px"
  chip-status-done:
    backgroundColor: "{colors.done-soft}"
    textColor: "{colors.done-deep}"
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
    backgroundColor: "{colors.bg}"
    rounded: "{rounded.dock}"
    padding: "8px"
  dock-button:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.xl}"
    size: "44px"
---

# Design System: 코드집

## Overview

**Creative North Star: "흰 종이 위의 파란 코드"**

코드집은 코드 악보 서비스라는 카테고리의 표준 화면을 그대로 받아들이고, 그 표준을 장난 없이 끝까지 다듬는다. 흰 바탕에 짙은 회색 가사, 그 위에 굵은 파란 코드. 기타를 든 사람이 모니터에서 한눈에 읽어야 하는 것은 코드와 가사뿐이므로, 나머지는 회색 면과 1px 선으로 조용히 물러난다. 품질 기준은 Ultimate Guitar다.

이 세계는 이전의 "어두운 연습실"(다크 바탕 + 앰버 액센트 + 모노 대문자 라벨)을 의식적으로 버린 결과다. 장식적 라벨, 네온 액센트, 어두운 무대 연출 대신 익숙한 도구의 밀도를 택했다. 컨트롤은 표준 테두리 버튼·스테퍼·세그먼트이며, 무엇을 하는지 버튼과 값 스스로 말한다.

밀도는 중간이다. 툴바는 한 줄, 카드는 16px 안쪽 여백, 악보는 줄 사이 12px. 깊이는 그림자가 아니라 면의 회색 단계와 선으로 만들고, 그림자는 화면 위에 떠 있는 모바일 독과 FAB에만 있다.

**Key Characteristics:**
- 흰 단일 테마, 파랑 하나만 액센트
- Noto Sans KR 한 가족이 제목·본문·코드를 모두 맡고, 모노는 TAB과 튜닝 글자에만
- 코드는 가사와 같은 크기의 굵은 파랑
- 그림자 없는 평면, 1px 선과 회색 면으로 구획
- 표준 테두리 컨트롤, 36px(데스크톱) / 44px(모바일) 높이

## Colors

흰 종이와 회색 잉크 위에 파랑 하나가 "지금 연주할 것"과 "켜진 것"을 가리키는 팔레트다.

### Primary
- **악보 파랑** (accent): 코드 글자, 주요 버튼(새 곡), 켜진 토글·선택된 세그먼트, 툴바 스테퍼의 현재 값, 강세 스트로크, 카포 바, 링크, 포커스 링. 화면에서 파랑이 보이면 그것은 코드이거나 조작 가능한 켜진 상태다.
- **깊은 파랑** (accent-deep): 주요 버튼과 링크의 hover, "연습중" 상태 칩의 글자.
- **옅은 파랑** (accent-soft): "연습중" 칩 바탕, 텍스트 선택 영역, 메트로놈 박 점의 링.
- **파랑 위 글자** (accent-ink): 파란 면 위의 흰 글자.

### Neutral
- **종이** (bg): 페이지·카드·툴바·컨트롤의 바탕. 카드도 종이색이며 테두리로만 구분한다.
- **회색 면** (surface-2): 메타 칩, TAB 블록, 컨트롤 hover, 모바일 독 버튼 바탕. 종이 위에 한 단계 들어간 면.
- **선** (line): 모든 1px 구획선 — 헤더 하단, 툴바 위아래, 카드·컨트롤 테두리, 2단 사이 세로선, 박 구분선.
- **진한 선** (line-strong): 모바일 독 테두리와 독 안 구분선, 꺼진 메트로놈 박 점, 프렛선, 태그 칩 hover 테두리.
- **잉크 1–5** (ink, ink-2, ink-3, ink-4, ink-5): 제목(ink) → 가사·칩 값(ink-2) → 컨트롤 글자·메모(ink-3) → 카드 설명(ink-4) → 보조 정보·섹션 라벨·칩 이름표(ink-5). ink-5까지 흰 바탕에서 4.5:1 이상.
- **희미한 회색** (faint): 장식 전용. TAB 줄 양끝 세로 막대, 헤더 경로 구분 "/". 읽어야 하는 글자에는 쓰지 않는다.
- **프렛 너트** (fret-nut): 카포 다이어그램의 너트.

### 상태색
- **완료 초록** (done, done-soft, done-deep): "완료" 상태 점과 칩(옅은 바탕 + 깊은 글자).
- **위험 빨강** (danger, danger-text): 편집기의 파싱 오류 줄 왼쪽 2px 막대와 옅은 바탕, 오류 문구.

### Named Rules
**The One Blue Rule.** 액센트는 파랑 하나뿐이다. 두 번째 액센트를 들이지 않는다. 초록·빨강은 상태를 말할 때만 쓴다.

**The Blue Means Chord-or-On Rule.** 파랑은 코드 글자이거나 켜진/주요 조작이다. 장식 제목, 아이콘 꾸밈, 배경 면에 파랑을 쓰지 않는다(옅은 파랑은 상태 칩과 선택 영역에만).

## Typography

**Display Font:** Noto Sans KR (system-ui 폴백)
**Body Font:** Noto Sans KR (system-ui 폴백) — 400/500/700
**Label/Mono Font:** Noto Sans Mono (ui-monospace 폴백) — 400/600, TAB과 튜닝 글자 전용

**Character:** 한 가족으로 모든 위계를 굵기와 크기만으로 만든다. 코드도 같은 가족의 굵은 글자라 가사와 자연스럽게 한 줄로 읽힌다.

### Hierarchy
- **Wordmark** (700, 20px, -0.02em): 상단 내비의 "코드집", 마지막 글자 "집"만 파랑.
- **Headline** (700, 28px, 1.25, -0.01em): 곡 제목 h1. 그 아래 "by 아티스트"는 16px ink-5, 아티스트 이름만 파랑 500.
- **Title** (700, 14px): 카드 제목(카포, 패턴 A/B, 연습 메모). 오른쪽 메타는 12px 400 ink-5.
- **Sheet** (가사 400 / 코드 700, 기본 18px, 1.5): 악보 컨테이너의 글자 크기 하나만 바꾸고 안쪽은 전부 em으로 따라간다. 코드는 가사와 같은 1em.
- **Section label** (700, 0.76em, 0.02em, ink-5): "[Verse 1]"처럼 대괄호를 붙인 회색 굵은 글자.
- **Body** (400, 13px, 1.6): 카드 설명·연습 메모(13.5px, 1.7).
- **Label** (500, 13px): 버튼·토글·칩 글자. 스테퍼 아래 단위는 11px ink-5.
- **Caption** (400, 12px): 카드 메타, 보조 안내.
- **TAB** (Noto Sans Mono 400, 0.66em, 1.6): TAB 줄과 줄 이름(E B G D A E). 튜닝 글자는 모노 600에 0.06–0.08em 자간.

### Named Rules
**The One Family Rule.** 제목·본문·코드·컨트롤 모두 Noto Sans KR. 모노는 칸 맞춤이 필요한 TAB과 튜닝 글자에만 쓰고, 라벨·제목·수치 일반에는 쓰지 않는다. 수치 정렬은 `tabular-nums`로 한다.

**The Same-Size Chord Rule.** 코드는 가사와 같은 크기(1em)의 굵은 파랑이다. 코드를 작게 줄이거나 다른 가족으로 바꾸지 않는다.

## Layout

- **페이지 컨테이너:** 최대 폭 1360px, 좌우 40px 여백, 가운데 정렬. 헤더·곡 머리·툴바·본문이 모두 같은 컨테이너를 공유해 왼쪽 선이 하나로 맞는다.
- **세로 흐름(데스크톱):** 60px 상단 내비(워드마크 · 경로 · 우측 동작) → 곡 머리(경로 13px, 28px 제목, by 아티스트, 메타 칩 줄과 우측 편집 버튼; 위 28px 아래 20px) → 툴바(위아래 1px 선, 안쪽 10px, 36px 컨트롤 한 줄 = 56px) → 본문. 화면 높이(100dvh)를 꽉 채우고 본문만 스크롤한다.
- **툴바:** 이조 · 오토스크롤 · 글자/단 · 메트로놈 그룹을 24px 세로 선으로 나누고, 집중 모드 버튼만 오른쪽 끝. 그룹 이름은 화면에 쓰지 않고 `role="group"` + `aria-label`로만 준다. 좁으면 줄바꿈(가로 12px, 세로 8px 간격).
- **본문:** 악보(가변) + 300px 카드 열. 둘 사이 32px, 1100px 이상에서 60px. 카드 사이 16px.
- **악보 리듬:** 블록 사이 12px, 섹션 라벨 위 24px 아래 10px. 단 간격 60px, 단 사이 1px 세로선.
- **2단:** 단 높이를 악보 영역 높이에 맞추고(column-fill auto) 왼쪽 단을 끝까지 채운 뒤 오른쪽으로 잇는다. 단이 넘치면 가로로 다음 단이 생기고, 악보 아래 1px 선 위에 "← 이전 단 / 다음 단 →" 넘김 줄이 나타난다. 섹션 라벨은 다음 블록과 붙여 단 끝에 혼자 남지 않게 한다.
- **집중 모드:** 내비와 곡 머리만 숨긴다. 툴바와 카드 열은 남는다.
- **모바일(768px 미만):** 상단은 44px 뒤로가기 · 제목(17px 700)/아티스트 · 음소거, 그 아래 카포·튜닝 칩. 본문은 좌우 12px, 패턴 카드 → 1단 악보. 하단에 떠 있는 독(좌우 8px, 아래 24px)이 두 줄로 오토스크롤·속도·메트로놈·BPM / 키·글자 크기를 담고, 악보는 독 높이만큼(150px) 아래 여백을 둔다.

## Elevation & Depth

평면 시스템이다. 페이지·카드·툴바는 그림자 없이 종이색 위의 1px 선과 회색 면(surface-2)으로 구분한다. 그림자는 스크롤하는 내용 위에 실제로 떠 있는 두 요소에만 있다.

### Shadow Vocabulary
- **독 그림자** (`box-shadow: 0 8px 24px rgba(17, 24, 39, 0.12), 0 1px 2px rgba(17, 24, 39, 0.06)`): 모바일 하단 독.
- **FAB 그림자** (`box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3)`): 모바일 새 곡 등록 버튼.

### Named Rules
**The Only-Floating-Things-Cast Rule.** 그림자는 내용 위에 고정되어 떠 있는 요소(독, FAB)만 갖는다. 카드·버튼·칩·툴바에는 그림자를 주지 않고 선과 면으로 구분한다.

## Shapes

부드럽지만 둥글지 않은 모서리. 작은 것일수록 작은 반경을 쓴다: 반복 횟수 배지 4px(xs) → 칩 6px(sm) → 버튼·스테퍼·세그먼트·TAB 블록 8px(md/lg) → 카드·독 버튼 10px(xl) → 모바일 독 16px(dock). 점(상태 점, 메트로놈 박 점)만 완전한 원이다.

테두리는 언제나 1px 선(line)이다. 묶음 컨트롤(스테퍼, 세그먼트, 글자 크기 쌍)은 하나의 테두리 상자 안에서 칸을 1px 세로선으로 나누고 바깥 모서리만 둥글린다. 켜진 상태는 테두리까지 파랑으로 채운다.

## Components

### Buttons
표준적이고 차분한 테두리 버튼. 높이로 맥락을 구분한다.
- **Shape:** 8px 반경, 데스크톱 36px 높이.
- **Primary:** 파랑 면 + 흰 글자, 14px 500, 좌우 16px, 아이콘과 7px 간격(내비의 "새 곡"). hover는 깊은 파랑.
- **Outline:** 종이 면 + 1px 선 + ink-3(편집은 ink-2) 13–14px, 좌우 12–16px. hover는 회색 면. 아이콘 전용은 36×36에 `aria-label` 필수.
- **Disabled:** 불투명도 40%, 기본 커서(2단 넘김 버튼).
- **Focus:** 전역 2px 파랑 외곽선, 2px 띄움.

### Toggles & Segmented
- **ToolToggle:** 36px 테두리 버튼에 아이콘 + 라벨(13px 500). 켜지면 테두리·면 모두 파랑, 글자 흰색. `aria-pressed`로 상태를 알린다. 데스크톱 툴바 전용.
- **Segmented(1단/2단):** 한 테두리 상자 안 칸들, 선택 칸은 파랑 면 + 흰 글자 500. 데스크톱 36px, 모바일 44px.
- **집중 모드:** 아이콘 버튼, 켜지면 테두리와 아이콘만 파랑.

### Stepper
값을 사이에 둔 −/+ 묶음.
- **툴바:** 36px 높이 테두리 상자, 36px −/+ 칸, 가운데 최소 56px 칸에 13px 700 파랑 값과 11px ink-5 단위(원키, 25 PX/S, BPM).
- **독:** 회색 우물(surface-2) 안에 44×44 −/+ 버튼, 값은 ink 색.

### Chips
- **메타 칩:** 28px, 회색 면, 6px 반경, 13px. 앞의 이름표(Key, Capo, Tuning)는 ink-5, 값은 ink-2 700. 이조 중이면 "G → A +2"처럼 원키 → 파란 현재 키 → 반음 수.
- **상태 칩:** 연습중(옅은 파랑/깊은 파랑), 완료(옅은 초록/깊은 초록), 보관(회색 면/ink-5), 13px 500.
- **태그 칩:** 종이 면 + 1px 선, ink-4 "#태그", hover에 진한 선.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** 종이색(bg). 회색 면 카드는 없다.
- **Shadow Strategy:** 없음(Elevation 참고).
- **Border:** 1px 선.
- **Internal Padding:** 16px, 안쪽 요소 간격 12px. 제목 줄은 14px 700 제목 + 오른쪽 12px 메타가 기준선 정렬.

### Navigation
- **상단 내비:** 60px, 하단 1px 선. 워드마크 → 희미한 "/" → 현재 곡 이름(13px ink-4) → 오른쪽 동작들(주요 버튼, 36px 아이콘 버튼). 데스크톱 전용, 모바일은 곡 화면 자체 상단 바를 쓴다.
- **경로:** 13px ink-5, hover에 ink-2.

### 악보 (Signature)
- **코드 줄:** 코드 한 개와 그 아래 가사 조각이 한 쌍으로 세로로 붙고, 쌍들이 줄바꿈하며 흐른다. 코드는 굵은 파랑, 가사는 ink-2, 행간 1.5.
- **섹션 라벨:** 회색 굵은 "[Verse 1]".
- **코멘트:** 0.82em ink-5 한 줄.
- **TAB 블록:** 회색 면, 8px 반경, 12px 14px 안쪽 여백. 머리 줄에 작은 파란 "TAB" 표시와 제목(ink-3), 오른쪽에 4px 반경 종이색 반복 배지(×3). 본문은 모노로 줄 이름 · 희미한 막대 · TAB 글자 · 막대.
- **오류 줄(편집기 미리보기):** 왼쪽 2px 빨강 막대와 옅은 빨강 바탕.

### 스트러밍 패턴 카드
카드 형태. 16칸(1 e & a ×4) 격자에 ↓/↑/· 글리프, 강세는 파랑 굵게 + 아래 10×2px 파랑 막대, 박 첫 칸은 굵은 ink-2 숫자와 왼쪽 1px 박 구분선. 하단에 11.5px 범례 "↓ 다운 · ↑ 업 · 파란색은 강세". 칸 폭은 데스크톱 16px, 모바일 20px. 모바일에서는 카드 머리 오른쪽에 44×44 A/B 전환 묶음이 붙는다.

### 카포 카드
카포 위치를 보여주는 프렛보드 SVG(너트 fret-nut, 프렛선 진한 선, 파란 둥근 카포 바)와 13px 설명 한 줄.

### 모바일 독
종이색 면, 진한 선 테두리, 16px 반경, 8px 안쪽, 독 그림자. 버튼은 44×44, 10px 반경, 회색 면, 켜지면 파랑 면 + 흰 아이콘. 메트로놈이 켜지면 버튼에 현재 박 번호를 띄우고 첫 박만 파랑 면. 그룹 사이는 26px 진한 세로선.

## Do's and Don'ts

### Do:
- **Do** 새 화면도 흰 바탕 + 회색 잉크 + 파랑 하나로 만든다. 기존 `@theme` 변수(`--color-*`, `--radius-*`)만 쓰고 새 hex를 만들지 않는다.
- **Do** 코드는 가사와 같은 1em의 굵은 파랑으로, 악보 크기는 컨테이너 글자 크기 하나로 조절한다.
- **Do** 구획은 1px 선(line)과 회색 면(surface-2)으로 한다.
- **Do** 컨트롤은 표준 테두리 버튼·스테퍼·세그먼트로 만들고 데스크톱 36px, 모바일 터치 타깃 44px 이상을 지킨다. 아이콘 전용 버튼에는 `aria-label`을 단다.
- **Do** 컨트롤 묶음의 이름이 필요하면 화면 글자 대신 `role="group"` + `aria-label`로 준다.
- **Do** 수치는 Noto Sans KR + `tabular-nums`로 정렬하고, 모노는 TAB과 튜닝 글자에만 쓴다.

### Don't:
- **Don't** 다크 바탕, 네온/앰버 같은 두 번째 액센트, 어두운 무대 연출로 돌아가지 않는다(2026-10-24 사용자 결정).
- **Don't** 모노 대문자 자간 라벨(예: "CONTINUE PRACTICE", "SOURCE · CHORDPRO")을 제목 위 표시나 컨트롤 이름으로 쓰지 않는다.
- **Don't** 카드·버튼·칩·툴바에 그림자를 주지 않는다. 그림자는 떠 있는 독과 FAB만.
- **Don't** 코드를 가사보다 작게 하거나 모노·다른 가족으로 쓰지 않는다.
- **Don't** 희미한 회색(faint)을 읽어야 하는 글자에 쓰지 않는다.
