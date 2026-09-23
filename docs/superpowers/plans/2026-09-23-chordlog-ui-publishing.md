# 코드집(chordlog) UI 퍼블리싱 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `design-handoff` 디자인 정본의 7개 아트보드를 Next.js App Router + Tailwind v4 컴포넌트로 옮겨, DB·인증·파서 없이 목 데이터만으로 전 화면이 동작하는 UI 레이어를 만든다.

**Architecture:** 빈 레포에 Next.js App Router 프로젝트를 세우고, `tokens.css`를 Tailwind v4 `@theme`로 이식한 뒤 화면을 조립한다. 데이터는 파서 출력 타입(`Block[]`)과 동일한 형태의 목 픽스처로 공급하므로, 이후 파서가 완성되면 픽스처 자리에 파서 결과를 꽂는 것만으로 연결된다. 연주 뷰의 화면 상태(키 시프트·글자 크기·단수·집중 모드·오토스크롤·메트로놈)는 `usePlayView` 훅 한 곳에 모아 데스크톱과 모바일이 공유한다.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · next/font (Hahmlet, Gothic A1, JetBrains Mono) · Vitest + @testing-library/react + jsdom

**Spec:**
- `design-handoff/docs/design/README.md` — 화면별 레이아웃·컴포넌트·상호작용 사양 (정본)
- `design-handoff/docs/design/tokens.css` — 색·타이포·radius 정본
- `design-handoff/docs/design/chordpro-spec.md` — 악보 포맷·도메인 로직
- `design-handoff/docs/design/artboards/` — 수치 확인용 아트보드 원본
- `design-handoff/README.md` · `design-handoff/CLAUDE.md.snippet.md`

---

## Global Constraints

프로젝트 전체에 적용된다. 모든 태스크의 요구사항에 암묵적으로 포함된다.

- **액센트 색은 `--gc-accent`(#FF9D4D) 하나뿐.** 두 번째 액센트 색을 도입하지 않는다.
- **타이포 3역할 고정.** 곡 제목 = Hahmlet(`font-display`), 문장·라벨·버튼·가사 = Gothic A1(`font-sans`), 코드·키·BPM·프렛·TAB 등 모든 수치 = JetBrains Mono(`font-mono`).
- **마이크로 라벨 조합 고정:** mono 10px / `letter-spacing: .16em` / 대문자 / `--gc-text-dim`(#565C68).
- **새 hex를 만들지 않는다.** 색은 `app/globals.css`의 `@theme` 토큰에서만 가져온다. 아트보드에서 발견한 토큰 미수록 색은 Task 1에서 정의한 `아트보드 실측값` 블록에만 추가한다.
- **모바일 터치 타깃 최소 44px.** 독 버튼 46×44, 아이콘 버튼 44×44. 절대 줄이지 않는다.
- **아이콘만 있는 버튼에 `aria-label` 필수.** 장식용 SVG는 `aria-hidden="true"`.
- **`div` + `onClick` 금지.** 실제 `<button>`, `<a href>`, `<input>` + `<label>`을 쓴다.
- **가짜 상태바·가짜 키보드를 그리지 않는다.** 모바일 상단 52px는 실제 상태바 자리로 비워 둔다.
- **그라데이션 배경 금지** (`/login` 상단 방사형 글로우 1겹이 유일한 예외). 이모지 금지. 카드 좌측 컬러 바 금지.
- **시안의 곡·아티스트·가사·TAB은 전부 가상 데이터다.** 목 픽스처 파일 상단에 그 사실을 주석으로 남기고, 실제 시드로 승격하지 않는다.
- **데스크톱 1440px / 모바일 390px 기준.** 그 사이는 모바일 레이아웃을 늘려 대응하고, 곡 상세의 좌측 레일은 1100px 미만에서 본문 위로 접는다.
- **`body`(악보 원문)는 언제나 원키 기준.** 이조·카포 결과를 저장하지 않는다. TAB·스트러밍 패턴은 이조 대상이 아니다.

---

## 이번 계획의 범위 경계 — 반드시 먼저 읽을 것

사용자 결정: **"비즈니스 로직을 작성하지 않고 UI만, 즉 퍼블리싱만 선행한다."**

**이번에 만드는 것**
- 7개 화면 전부 (`/`, `/songs/[slug]`, `/songs/new`, `/songs/[slug]/edit`, `/login`, `/tags/[name]`, 그리고 각 화면의 모바일 레이아웃)
- 순수 화면 상태 상호작용: 집중 모드, 1단/2단, 글자 크기 ∓, 오토스크롤(실제 스크롤 동작), 키 스테퍼, BPM 스테퍼, TAP 템포, 탭 전환, 패턴 A/B 토글

**이번에 만들지 않는 것 (모두 "추후 적용")**
- ChordPro **파서** — 텍스트 → `Block[]` 변환. 이번에는 목 픽스처가 `Block[]`을 직접 공급한다.
- **DB·영속화·검색(FTS5)** — 목록·상세 데이터는 전부 `lib/mock/`에서 온다.
- **인증** — `/login`은 화면만. 제출 핸들러 없음. 비로그인 분기는 픽스처 플래그(`IS_ADMIN`) 하나로 흉내 낸다.
- **메트로놈 소리** — Web Audio 스케줄러는 연습 도구 단계에서. 이번에는 **시각 박자만** 돈다(코드에 `ponytail:` 주석으로 업그레이드 경로 명시).
- **에디터의 실제 파싱·저장** — 미리보기는 고정 픽스처를 렌더링하고, 오류 스트립도 픽스처 기반 고정 표시다.

**딱 하나 포함하는 도메인 함수: `transposeChord()` (Task 3).**
이조가 없으면 연주 뷰의 KEY 표시·컨트롤 바·독이 전부 빈 껍데기가 되어 퍼블리싱 품질을 확인할 수 없다. `chordpro-spec.md` §7에 알고리즘과 테스트 기준이 이미 확정되어 있고, 구현은 20줄 순수 함수다. **빼고 싶으면 Task 3을 삭제하고 키 배지를 원키 고정으로 두면 된다** — 다른 태스크는 이 함수를 `lib/chordpro/transpose.ts` 경유로만 쓰므로 영향 범위가 한 파일이다.

---

## File Structure

만들 파일과 각 파일의 책임. 이 구조가 태스크 경계를 결정한다.

```
app/
  layout.tsx                      루트 레이아웃 — 폰트 변수, <html lang="ko">, body 기본값
  globals.css                     Tailwind v4 진입 + @theme 토큰 + .gc-pair/.gc-line 원자 규칙
  page.tsx                        / 곡 목록 (데스크톱·모바일 한 레이아웃)
  login/page.tsx                  /login
  songs/[slug]/page.tsx           /songs/[slug] 곡 상세·연주 뷰
  songs/new/page.tsx              /songs/new 작성
  songs/[slug]/edit/page.tsx      /songs/[slug]/edit — new와 같은 컴포넌트 재사용
  tags/[name]/page.tsx            /tags/[name] — 목록 레이아웃 재사용

components/
  chrome/SiteHeader.tsx           데스크톱 헤더 60px (변형: 목록/상세/에디터)
  chrome/MobileTopBar.tsx         모바일 상단(상태바 52px 여백 포함)
  ui/MicroLabel.tsx               mono 10px 대문자 마이크로 라벨
  ui/StatusMark.tsx               상태 점 + 텍스트 (row / pill 두 변형)
  ui/Badge.tsx                    TAB · DROP D 배지
  ui/Stepper.tsx                  −/값/+ 스테퍼 (bar / dock 두 크기)
  ui/Segmented.tsx                1단·2단, 작성·미리보기 같은 세그먼트
  ui/ToolToggle.tsx               오토스크롤·메트로놈 토글 버튼 (on/off 스타일)
  ui/UnderlineField.tsx           밑줄 입력 래퍼 (라벨 + 하단 1px)
  song/Fretboard.tsx              카포 프렛보드 SVG — rail/bar/row/editor 4크기
  song/TuningTokens.tsx           6현 토큰 (+ 줄번호, 비표준 줄 앰버 강조)
  song/TrackList.tsx              트랙리스트 헤더 + 행 (데스크톱 그리드/모바일 flex)
  song/ContinueCard.tsx           `이어서 연습` 히어로 카드
  song/InfoRail.tsx               곡 상세 좌측 레일 352px
  sheet/Sheet.tsx                 Block[] → 악보 시트 (단수·글자 크기 컨테이너)
  sheet/ChordLine.tsx             {chord,text} 쌍 줄 (.gc-line/.gc-pair)
  sheet/SectionLabel.tsx          섹션 라벨 + 헤어라인
  sheet/CommentBlock.tsx          연주 메모 (좌측 2px 선)
  sheet/TabBlock.tsx              TAB 카드 6줄
  sheet/StrumGrid.tsx             16칸 스트러밍 그리드 (데스크톱 25px / 모바일 20px)
  play/ControlBar.tsx             2단 컨트롤 바 (KEY단 + PLAY단)
  play/MobileDock.tsx             모바일 하단 플로팅 독 2단
  editor/MetaForm.tsx             12컬럼 메타 그리드 (밑줄 입력 + 박스 카드 3종)
  editor/InsertToolbar.tsx        삽입 툴바 ([코드] 섹션 스트러밍 TAB 6줄 메모)
  editor/SourcePane.tsx           소스 패널 (줄번호 거터 48px + textarea + 오류 스트립)
  editor/PreviewPane.tsx          미리보기 패널
  editor/SongEditor.tsx           에디터 전체 조립 (데스크톱 2분할 / 모바일 탭)

lib/
  types.ts                        Block · Slot · Pair · Song · SongStatus
  chordpro/transpose.ts           transposeChord() — 유일한 도메인 함수
  ui/playView.ts                  usePlayView() 훅 — 연주 뷰 화면 상태 전부
  mock/songs.ts                   목 곡 데이터 (가상 데이터 주석 포함)
  mock/flags.ts                   IS_ADMIN — 비로그인 분기 흉내

docs/design/                      design-handoff에서 복사한 디자인 정본
CLAUDE.md                         핸드오프 스니펫 적용
```

---

### Task 1: 프로젝트 부트스트랩 — Next.js + Tailwind v4 + 토큰 + 테스트 러너

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs` (create-next-app 생성물)
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Create: `CLAUDE.md`
- Create: `docs/design/**` (design-handoff에서 복사)
- Test: `lib/__tests__/tokens.test.ts`

**Interfaces:**
- Consumes: 없음 (첫 태스크)
- Produces: Tailwind 토큰 유틸리티 이름 전체 — `bg-bg` `bg-surface` `bg-surface-2` `bg-surface-3` `bg-sunk` `bg-control` `border-line` `border-line-soft` `border-line-hair` `border-line-strong` `border-line-grid` `border-line-header` `border-line-chip` `text-ink` `text-ink-2` `text-ink-3` `text-ink-4` `text-ink-5` `text-dim` `text-faint` `text-lyric` `text-tab` `text-accent` `bg-accent` `text-accent-ink` `text-accent-mute` `bg-done` `bg-archived` `text-danger` `text-danger-text`, 폰트 `font-display` `font-sans` `font-mono`, radius `rounded-xs|sm|md|lg|xl|dock|pill`, 그림자 `shadow-dock` `shadow-fab`. 이후 모든 태스크가 이 이름만 쓴다.

- [ ] **Step 1: create-next-app을 임시 디렉터리에 받고 루트로 옮긴다**

레포 루트에 이미 `docs/`와 `design-handoff/`가 있어 `create-next-app .`은 충돌로 거부된다. 임시 디렉터리를 경유한다.

```bash
cd /c/Users/Gravity/Desktop/Workspace/chordlog
npx create-next-app@latest .tmp-scaffold --ts --app --tailwind --eslint --no-src-dir --import-alias "@/*" --use-npm --turbopack
mv .tmp-scaffold/app .tmp-scaffold/public .tmp-scaffold/package.json .tmp-scaffold/package-lock.json \
   .tmp-scaffold/tsconfig.json .tmp-scaffold/next.config.ts .tmp-scaffold/eslint.config.mjs \
   .tmp-scaffold/postcss.config.mjs .tmp-scaffold/next-env.d.ts .
rm -rf .tmp-scaffold
```

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 2: 디자인 정본을 레포로 복사하고 CLAUDE.md를 만든다**

```bash
cp -r design-handoff/docs/design docs/design
```

`CLAUDE.md`를 만든다 — `design-handoff/CLAUDE.md.snippet.md`의 코드 블록 내용 그대로 옮기고, 맨 아래에 이번 범위 안내를 덧붙인다.

```markdown
## 디자인

UI 작업(새 화면, 컴포넌트, 스타일 수정) 전에 반드시 읽을 것:

- `docs/design/README.md` — 화면별 레이아웃·컴포넌트·상호작용 사양
- `docs/design/tokens.css` — 색·타이포·radius 정본. 새 hex를 만들지 말고 여기 변수를 쓸 것
- `docs/design/chordpro-spec.md` — 악보 포맷과 도메인 로직(이조·카포·TAB·스트러밍)

`docs/design/artboards/`는 디자인 캔버스 전용 포맷(`.dc.html`)이다. 수치를 읽어가는
참고용이며 그대로 복사해 쓰지 않는다. 브라우저에서 바로 볼 수 있는 4개 화면은
`docs/design/artboards/standalone/`에 있다.

규칙:
- 액센트 색은 `--gc-accent` 하나뿐이다. 두 번째 액센트를 도입하지 말 것
- 곡 제목은 Hahmlet, 모든 수치(키·BPM·프렛·TAB)는 JetBrains Mono
- 모바일 터치 타깃 최소 44px, 아이콘 버튼에 aria-label 필수
- `body`는 언제나 원키 기준. 이조·카포 결과를 저장하지 않는다
- TAB과 스트러밍 패턴은 이조 대상이 아니다
- 시안의 곡·가사·TAB은 전부 가상 데이터다. 시드로 쓰지 말 것

## 구현 범위 (2026-09-23 기준)

지금은 UI 퍼블리싱 단계다. 파서·DB·인증·메트로놈 소리는 만들지 않는다.
데이터는 `lib/mock/`에서만 온다. 경계는
`docs/superpowers/plans/2026-09-23-chordlog-ui-publishing.md`의 "범위 경계"를 읽을 것.
```

- [ ] **Step 3: `app/globals.css`를 토큰 정본으로 교체한다**

create-next-app이 만든 내용을 전부 지우고 아래로 바꾼다. 값 출처는 `docs/design/tokens.css`.

```css
@import "tailwindcss";

@theme {
  /* 바탕 */
  --color-bg:        #0C0D10;
  --color-surface:   #131418;
  --color-surface-2: #141519;
  --color-surface-3: #181A20;
  --color-sunk:      #0A0B0E;
  --color-control:   #22252C;

  /* 선 */
  --color-line:        #24262E;
  --color-line-soft:   #1E2027;
  --color-line-hair:   #16181D;
  --color-line-strong: #2A2D36;
  --color-line-grid:   #22242B;

  /* 글자 */
  --color-ink:   #F4F4F5;
  --color-ink-2: #C9CDD5;
  --color-ink-3: #A1A6B0;
  --color-ink-4: #8A909C;
  --color-ink-5: #6E7480;
  --color-dim:   #565C68;
  --color-faint: #4A4F5A;
  --color-lyric: #E9EAEC;
  --color-tab:   #D8DBE0;

  /* 액센트 — 하나뿐 */
  --color-accent:      #FF9D4D;
  --color-accent-ink:  #1A1206;
  --color-accent-mute: #C9A183;

  /* 상태 */
  --color-done:        #5BD0A0;
  --color-archived:    #4A4F5A;
  --color-danger:      #FF6B5A;
  --color-danger-text: #FF9A8E;

  /* 아트보드 실측값 — tokens.css 미수록.
     새 색을 만들지 말고 반드시 여기 것만 쓴다. 디자인 오너에게 정본 편입을 물을 것. */
  --color-line-header: #1A1C22;
  --color-line-chip:   #262A33;
  --color-fret-nut:    #5A606C;
  --color-fret-string: #2F333C;
  --color-hairline:    #3A3E47;
  --color-rest:        #33373F;
  --color-dock-well:   #0F1116;

  /* 타이포 — 실제 패밀리는 next/font가 --font-* 변수로 주입 */
  --font-display: var(--font-hahmlet), 'Nanum Myeongjo', serif;
  --font-sans:    var(--font-gothic-a1), system-ui, sans-serif;
  --font-mono:    var(--font-jetbrains-mono), ui-monospace, monospace;

  /* 모서리 */
  --radius-xs:   5px;
  --radius-sm:   7px;
  --radius-md:   9px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-dock: 20px;
  --radius-pill: 999px;

  /* 그림자 — 딱 두 군데 */
  --shadow-dock: 0 14px 34px rgba(0, 0, 0, 0.6);
  --shadow-fab:  0 10px 30px rgba(0, 0, 0, 0.55);
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
  a { color: var(--color-accent); }
  a:hover { color: #FFBC86; }
  ::selection { background: rgba(255, 157, 77, 0.28); }
}

/* 악보 렌더링 원자 단위 — 코드 한 개 + 붙는 가사 조각.
   시트 컨테이너의 font-size만 바꾸고 내부는 전부 em으로 따라간다. */
.gc-pair { display: inline-flex; flex-direction: column; align-items: flex-start; }
.gc-pair > .chord {
  font-family: var(--font-mono);
  font-size: 0.76em;
  font-weight: 700;
  color: var(--color-accent);
  min-height: 1.5em;
  letter-spacing: -0.01em;
}
.gc-pair > .lyric { white-space: pre; }

.gc-line {
  display: flex; flex-wrap: wrap; align-items: flex-end;
  line-height: 1.5; color: var(--color-lyric);
}
```

- [ ] **Step 4: `app/layout.tsx`에 폰트 3종을 연결한다**

```tsx
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
```

- [ ] **Step 5: Vitest를 붙인다**

```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  test: { environment: 'jsdom', setupFiles: ['./vitest.setup.ts'], globals: true },
});
```

`vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

`package.json`의 `scripts`에 두 줄을 추가한다:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: 토큰이 실제로 정의됐는지 검사하는 실패 테스트를 쓴다**

`lib/__tests__/tokens.test.ts` — 화면이 참조하는 색 이름이 `globals.css`에서 빠지면 조용히 투명해지므로, 이름 목록을 한 번 고정해 둔다.

```ts
import { readFileSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, '../../app/globals.css'), 'utf8');

const REQUIRED = [
  '--color-bg', '--color-surface', '--color-surface-2', '--color-surface-3',
  '--color-sunk', '--color-control', '--color-line', '--color-line-soft',
  '--color-line-hair', '--color-line-strong', '--color-line-grid',
  '--color-line-header', '--color-line-chip', '--color-ink', '--color-ink-2',
  '--color-ink-3', '--color-ink-4', '--color-ink-5', '--color-dim',
  '--color-faint', '--color-lyric', '--color-tab', '--color-accent',
  '--color-accent-ink', '--color-accent-mute', '--color-done',
  '--color-archived', '--color-danger', '--color-danger-text',
  '--font-display', '--font-sans', '--font-mono',
];

describe('디자인 토큰', () => {
  it.each(REQUIRED)('%s 토큰이 정의되어 있다', (name) => {
    expect(css).toContain(`${name}:`);
  });

  it('액센트는 하나뿐이다 — 정본 hex 그대로', () => {
    expect(css).toContain('--color-accent:      #FF9D4D;');
  });

  it('악보 원자 규칙이 있다', () => {
    expect(css).toContain('.gc-pair');
    expect(css).toContain('.gc-line');
  });
});
```

Run: `npm test -- tokens`
Expected: PASS (Step 3을 먼저 했다면 통과. 실패하면 빠진 토큰 이름이 그대로 출력된다)

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "chore: bootstrap next.js app router with tailwind v4 design tokens"
```

---

### Task 2: 도메인 타입과 목 데이터

**Files:**
- Create: `lib/types.ts`
- Create: `lib/mock/songs.ts`
- Create: `lib/mock/flags.ts`
- Test: `lib/mock/__tests__/songs.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `type Slot = { stroke: 'D' | 'U' | null; accent: boolean }`
  - `type Pair = { chord: string | null; text: string }`
  - `type Block` — `label` | `line` | `comment` | `strum` | `tab` 5종 유니온
  - `type SongStatus = 'practicing' | 'done' | 'archived'`, `STATUS_LABEL`
  - `type Song`, `type SongSummary`, `STANDARD_TUNING`
  - `MOCK_SONGS: Song[]`, `getSong(slug)`, `MOCK_STATS`, `CONTINUE_SONG`
  - `IS_ADMIN: boolean`

- [ ] **Step 1: 타입을 쓴다**

`lib/types.ts` — `docs/design/chordpro-spec.md` §4의 파서 출력 타입 그대로. 파서가 나중에 이 타입을 그대로 반환하므로 필드를 바꾸지 않는다.

```ts
export type Slot = { stroke: 'D' | 'U' | null; accent: boolean };

export type Pair = { chord: string | null; text: string };

export type Block =
  | { k: 'label'; label: string }
  | { k: 'line'; pairs: Pair[] }
  | { k: 'comment'; text: string }
  | { k: 'strum'; use: string; slots: Slot[] }      // slots는 정확히 16개
  | { k: 'tab'; title: string; repeat: string; lines: string[] }; // lines는 정확히 6줄

export type SongStatus = 'practicing' | 'done' | 'archived';

export const STATUS_LABEL: Record<SongStatus, string> = {
  practicing: '연습중',
  done: '완성',
  archived: '보관',
};

export type Song = {
  slug: string;
  title: string;
  artist: string;
  key: string;          // 원키. 예: 'G'
  capo: number;         // 0~7. 표시 전용 — 코드에 영향 없음
  tuning: string;       // 6번줄(low E) → 1번줄. 예: 'E A D G B E'
  tempo: number;        // BPM
  status: SongStatus;
  tags: string[];
  updatedLabel: string; // '3일 전' — 실제 날짜 포맷은 데이터 단계에서
  hasTab: boolean;
  note?: string;        // PRACTICE NOTE
  reference?: string;   // 원본 영상 URL
  blocks: Block[];
};

export type SongSummary = Omit<Song, 'blocks' | 'note' | 'reference'>;

export const STANDARD_TUNING = 'E A D G B E';
```

- [ ] **Step 2: 실패 테스트를 쓴다**

`lib/mock/__tests__/songs.test.ts`:

```ts
import { MOCK_SONGS, getSong } from '@/lib/mock/songs';

describe('목 곡 데이터', () => {
  it('스트러밍 블록은 슬롯이 정확히 16개다', () => {
    for (const song of MOCK_SONGS) {
      for (const b of song.blocks) {
        if (b.k === 'strum') expect(b.slots).toHaveLength(16);
      }
    }
  });

  it('TAB 블록은 정확히 6줄이다', () => {
    for (const song of MOCK_SONGS) {
      for (const b of song.blocks) {
        if (b.k === 'tab') expect(b.lines).toHaveLength(6);
      }
    }
  });

  it('hasTab 플래그가 실제 TAB 블록 유무와 일치한다', () => {
    for (const song of MOCK_SONGS) {
      expect(song.hasTab).toBe(song.blocks.some((b) => b.k === 'tab'));
    }
  });

  it('slug는 중복되지 않는다', () => {
    const slugs = MOCK_SONGS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('slug로 곡을 찾는다', () => {
    expect(getSong(MOCK_SONGS[0].slug)?.title).toBe(MOCK_SONGS[0].title);
    expect(getSong('없는-곡')).toBeUndefined();
  });
});
```

Run: `npm test -- songs`
Expected: FAIL — `Cannot find module '@/lib/mock/songs'`

- [ ] **Step 3: 목 데이터를 쓴다**

`lib/mock/songs.ts`. 스트러밍 슬롯은 16자 스펙 문자열 + 강세 인덱스 배열로 만든다 — 아트보드 `pattern()`과 같은 방식이다.

```ts
// ⚠ 이 파일의 곡·아티스트·가사·TAB·연주 메모는 전부 지어낸 가상 데이터다.
// 저작권 문제를 피하려고 만든 시안 데이터이므로 실제 시드로 승격하지 말 것.
// (docs/design/README.md §7)

import type { Block, Slot, Song } from '@/lib/types';

function slots(spec: string, accents: number[]): Slot[] {
  return Array.from({ length: 16 }, (_, i) => {
    const c = spec.charAt(i);
    return {
      stroke: c === 'D' ? 'D' : c === 'U' ? 'U' : null,
      accent: accents.includes(i),
    };
  });
}

function line(...pairs: [string | null, string][]): Block {
  return { k: 'line', pairs: pairs.map(([chord, text]) => ({ chord, text })) };
}

const ALLEY_BLOCKS: Block[] = [
  { k: 'strum', use: 'Intro (첫 G 두 번) · Verse 1 · Pre-Chorus', slots: slots('D-D-DUD-D-D-DU--', [4, 12]) },
  { k: 'strum', use: 'Intro · Chorus · Verse 2 · Interlude · Bridge · Outro', slots: slots('D-D-D-DUDUD-D-DU', [4, 8, 12]) },
  { k: 'label', label: 'Intro' },
  {
    k: 'tab',
    title: '메인 리프',
    repeat: '×3',
    lines: [
      '-------------10------------',
      '--13-11----11----11----11--',
      '-------10----------10------',
      '---------------------------',
      '---------------------------',
      '---------------------------',
    ],
  },
  { k: 'label', label: 'Verse 1' },
  line(['G', '가로등 하나 '], ['Em', '꺼지고 남은 자리']),
  line(['Am', '우린 아직 '], ['D7', '여기 앉아 있어']),
  line(['G', '식은 커피를 '], ['Em', '사이에 두고']),
  line(['Am', '밤이 다 가도 '], ['D7', '모르는 채로']),
  { k: 'label', label: 'Chorus' },
  line(['C', '나는 그 밤을 '], ['G/B', '오래 접어두고']),
  line(['Am7', '가끔 꺼내 '], ['D', '읽어요']),
  line(['C', '아무 말 없이 '], ['G/B', '웃던 얼굴이']),
  line(['Am7', '아직 여기 '], ['D', '남아서']),
  { k: 'label', label: 'Interlude' },
  { k: 'comment', text: '패턴 B로 바뀝니다 — 손목 힘 빼고' },
  {
    k: 'tab',
    title: '간주 변형',
    repeat: '×3',
    lines: [
      '-------------10------------',
      '--13-11----11----11--------',
      '-------10----------10------',
      '---------------------------',
      '---------------------------',
      '---------------------------',
    ],
  },
  { k: 'label', label: 'Verse 2' },
  line(['G', '첫차가 오면 '], ['Em', '일어날 거야']),
  line(['Am', '그때까진 '], ['D7', '조금만 더 앉아']),
  line(['G', '골목 끝까지 '], ['Em', '같이 걸어요']),
  line(['Am', '새벽 두 시의 '], ['D7', '골목']),
  { k: 'label', label: 'Bridge' },
  line(['Em', '말하지 않아도 '], ['Bm7', '알겠다는 듯이']),
  line(['C', '고개를 끄덕이던 '], ['D', '너의 옆얼굴']),
  { k: 'label', label: 'Outro' },
  line(['C', '두 시의 골목 '], ['G', '그대로']),
  { k: 'comment', text: '마지막은 스트로크 없이 아르페지오로' },
];

const SIMPLE_BLOCKS: Block[] = [
  { k: 'strum', use: 'Verse · Chorus', slots: slots('D-DUD-DUD-DUD-DU', [0, 8]) },
  { k: 'label', label: 'Verse 1' },
  line(['C', '창문을 열면 '], ['Am', '겨울이 들어와']),
  line(['F', '정류장 불빛이 '], ['G', '흔들려']),
  { k: 'label', label: 'Chorus' },
  line(['F', '조금만 더 '], ['C', '기다릴게']),
  line(['Dm7', '다음 차가 '], ['G', '올 때까지']),
];

export const MOCK_SONGS: Song[] = [
  {
    slug: 'saebyeok-du-siui-golmok',
    title: '새벽 두 시의 골목',
    artist: '무렵',
    key: 'G',
    capo: 2,
    tuning: 'E A D G B E',
    tempo: 72,
    status: 'practicing',
    tags: ['포크', '핑거스타일'],
    updatedLabel: '3일 전',
    hasTab: true,
    note: 'Chorus 들어가기 전 한 박 쉬고 시작. Intro 리프는 13 → 11 슬라이드로 붙이면 편하다. 오토스크롤은 1.25×가 딱 맞음.',
    reference: 'https://www.youtube.com',
    blocks: ALLEY_BLOCKS,
  },
  {
    slug: 'gyeoul-jeongnyujang',
    title: '겨울 정류장',
    artist: '이하루',
    key: 'F',
    capo: 1,
    tuning: 'D A D G B E',
    tempo: 84,
    status: 'practicing',
    tags: ['발라드'],
    updatedLabel: '오늘',
    hasTab: false,
    blocks: SIMPLE_BLOCKS,
  },
  {
    slug: 'neujeun-pyeonji',
    title: '늦은 편지',
    artist: '무렵',
    key: 'C',
    capo: 0,
    tuning: 'E A D G B E',
    tempo: 68,
    status: 'practicing',
    tags: ['포크'],
    updatedLabel: '오늘',
    hasTab: false,
    blocks: SIMPLE_BLOCKS,
  },
  {
    slug: 'mogyoire-chang',
    title: '목요일의 창',
    artist: '밤섬편지',
    key: 'Am',
    capo: 1,
    tuning: 'E A D G B E',
    tempo: 76,
    status: 'practicing',
    tags: ['시티팝'],
    updatedLabel: '어제',
    hasTab: true,
    blocks: ALLEY_BLOCKS,
  },
  {
    slug: 'oraedoen-radio',
    title: '오래된 라디오',
    artist: '청계삼가',
    key: 'A',
    capo: 0,
    tuning: 'E A D G B E',
    tempo: 92,
    status: 'practicing',
    tags: ['시티팝'],
    updatedLabel: '5일 전',
    hasTab: false,
    blocks: SIMPLE_BLOCKS,
  },
  {
    slug: 'usan-eopsi',
    title: '우산 없이',
    artist: '이하루',
    key: 'C',
    capo: 0,
    tuning: 'E A D G B E',
    tempo: 100,
    status: 'done',
    tags: ['발라드'],
    updatedLabel: '1주 전',
    hasTab: false,
    blocks: SIMPLE_BLOCKS,
  },
  {
    slug: 'yeoreumi-gireotda',
    title: '여름이 길었다',
    artist: '소금북',
    key: 'D',
    capo: 0,
    tuning: 'E A D G B E',
    tempo: 88,
    status: 'done',
    tags: ['포크'],
    updatedLabel: '2주 전',
    hasTab: false,
    blocks: SIMPLE_BLOCKS,
  },
  {
    slug: 'cheot-chareul-nochigo',
    title: '첫 차를 놓치고',
    artist: '무렵',
    key: 'Em',
    capo: 3,
    tuning: 'E A D G B E',
    tempo: 70,
    status: 'archived',
    tags: ['포크'],
    updatedLabel: '3주 전',
    hasTab: false,
    blocks: SIMPLE_BLOCKS,
  },
];

export const MOCK_STATS = {
  total: MOCK_SONGS.length,
  practicing: MOCK_SONGS.filter((s) => s.status === 'practicing').length,
};

export function getSong(slug: string) {
  return MOCK_SONGS.find((s) => s.slug === slug);
}

/** 히어로 `이어서 연습` 카드에 쓰는 가장 최근 수정 곡 */
export const CONTINUE_SONG = MOCK_SONGS[0];
```

`lib/mock/flags.ts`:

```ts
/** 비로그인 방문자는 읽기 전용 — 편집/새 곡 버튼을 아예 렌더링하지 않는다(비활성화가 아니라 미표시).
 *  인증이 붙기 전까지 이 플래그 하나로 분기한다. (docs/design/README.md §5-8) */
export const IS_ADMIN = true;
```

Run: `npm test -- songs`
Expected: PASS

- [ ] **Step 4: 커밋**

```bash
git add lib
git commit -m "feat: add domain types and mock song fixtures"
```

---

### Task 3: 이조 함수 — 이번 범위의 유일한 도메인 함수

**Files:**
- Create: `lib/chordpro/transpose.ts`
- Test: `lib/chordpro/__tests__/transpose.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `transposeChord(name: string, semi: number): string`, `keyLabel(semi: number): string`

- [ ] **Step 1: 실패 테스트를 쓴다**

`docs/design/chordpro-spec.md` §7의 규칙과 예시 그대로.

`lib/chordpro/__tests__/transpose.test.ts`:

```ts
import { transposeChord, keyLabel } from '@/lib/chordpro/transpose';

describe('transposeChord', () => {
  it('올리는 방향은 샤프로 적는다', () => {
    expect(transposeChord('Am7', +2)).toBe('Bm7');
    expect(transposeChord('G/B', +2)).toBe('A/C#');
  });

  it('내리는 방향은 플랫으로 적는다', () => {
    expect(transposeChord('G/B', -2)).toBe('F/A');
    expect(transposeChord('A', -1)).toBe('Ab');
  });

  it('퀄리티·텐션 문자열은 그대로 보존한다', () => {
    expect(transposeChord('F#m7b5', +1)).toBe('Gm7b5');
    expect(transposeChord('Csus4', +2)).toBe('Dsus4');
  });

  it('0 시프트는 입력 그대로 돌려준다', () => {
    expect(transposeChord('Am7', 0)).toBe('Am7');
  });

  it('모르는 표기도 내용을 잃지 않는다', () => {
    expect(transposeChord('N.C.', +2)).toBe('N.C.');
    expect(transposeChord('', +2)).toBe('');
  });

  it('12키 전조가 모두 유효한 코드 토큰을 낸다', () => {
    const valid = /^[A-G](#|b)?[^/]*(\/[A-G](#|b)?)?$/;
    for (const chord of ['G', 'Am7', 'Csus4', 'F#m7b5', 'G/B']) {
      for (let semi = -11; semi <= 11; semi++) {
        expect(transposeChord(chord, semi)).toMatch(valid);
      }
    }
  });
});

describe('keyLabel', () => {
  it('양수에는 +를 붙인다', () => {
    expect(keyLabel(2)).toBe('+2');
    expect(keyLabel(0)).toBe('0');
    expect(keyLabel(-3)).toBe('-3');
  });
});
```

Run: `npm test -- transpose`
Expected: FAIL — 모듈 없음

- [ ] **Step 2: 구현한다**

`lib/chordpro/transpose.ts` — 아트보드 `SongDetail.dc.html`의 `tr()`을 TypeScript로 옮긴 것.

```ts
const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const INDEX: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

/** 루트와 베이스만 반음 단위로 옮기고 퀄리티·텐션 문자열은 그대로 둔다.
 *  올리는 방향(+)은 샤프, 내리는 방향(-)은 플랫으로 표기한다.
 *  이명동음 예외(E# / Cb)는 v1에서 처리하지 않는다. (chordpro-spec.md §7) */
export function transposeChord(name: string, semi: number): string {
  const m = /^([A-G][#b]?)([\s\S]*)$/.exec(name ?? '');
  if (!m) return name;

  const root = m[1];
  let rest = m[2] ?? '';
  let bass = '';
  const slash = rest.indexOf('/');
  if (slash >= 0) {
    bass = rest.slice(slash + 1);
    rest = rest.slice(0, slash);
  }

  const i = INDEX[root];
  if (i === undefined) return name;

  const scale = semi >= 0 ? SHARP : FLAT;
  const shift = (n: number) => scale[(((n + semi) % 12) + 12) % 12];

  let out = shift(i) + rest;
  if (bass) {
    const bi = INDEX[bass];
    out += '/' + (bi === undefined ? bass : shift(bi));
  }
  return out;
}

/** 컨트롤 바·독·URL에 쓰는 시프트 라벨 */
export function keyLabel(semi: number): string {
  return semi > 0 ? `+${semi}` : String(semi);
}
```

Run: `npm test -- transpose`
Expected: PASS

- [ ] **Step 3: 커밋**

```bash
git add lib/chordpro
git commit -m "feat: add chord transposition per chordpro spec"
```

---

### Task 4: UI 프리미티브 7종

**Files:**
- Create: `components/ui/MicroLabel.tsx`
- Create: `components/ui/StatusMark.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/Stepper.tsx`
- Create: `components/ui/Segmented.tsx`
- Create: `components/ui/ToolToggle.tsx`
- Create: `components/ui/UnderlineField.tsx`
- Test: `components/ui/__tests__/primitives.test.tsx`

**Interfaces:**
- Consumes: Task 1의 토큰 유틸리티, Task 2의 `SongStatus` / `STATUS_LABEL`
- Produces:
  - `<MicroLabel>{children}</MicroLabel>` — `as?: 'span' | 'label'`, `htmlFor?: string`, `className?: string`
  - `<StatusMark status: SongStatus; variant?: 'row' | 'pill' />`
  - `<Badge tone?: 'accent' | 'neutral'>{children}</Badge>`
  - `<Stepper label: string; value: string; sub?: string; onDec: () => void; onInc: () => void; decLabel: string; incLabel: string; size?: 'bar' | 'dock' />`
  - `<Segmented options: {value: string; label: string}[]; value: string; onChange: (v: string) => void; grow?: boolean />`
  - `<ToolToggle active: boolean; onClick: () => void; icon: ReactNode; label?: string; ariaLabel?: string />`
  - `<UnderlineField label: string; htmlFor: string; span?: number>{children}</UnderlineField>`

- [ ] **Step 1: 실패 테스트를 쓴다**

`components/ui/__tests__/primitives.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MicroLabel } from '@/components/ui/MicroLabel';
import { StatusMark } from '@/components/ui/StatusMark';
import { Stepper } from '@/components/ui/Stepper';
import { Segmented } from '@/components/ui/Segmented';
import { ToolToggle } from '@/components/ui/ToolToggle';

describe('MicroLabel', () => {
  it('마이크로 라벨 조합(mono 10px / .16em / 대문자 / dim)을 적용한다', () => {
    render(<MicroLabel>key</MicroLabel>);
    const el = screen.getByText('key');
    expect(el.className).toContain('font-mono');
    expect(el.className).toContain('uppercase');
    expect(el.className).toContain('text-dim');
  });
});

describe('StatusMark', () => {
  it('상태를 한글 라벨로 보여준다', () => {
    render(<StatusMark status="practicing" />);
    expect(screen.getByText('연습중')).toBeInTheDocument();
  });

  it('완성은 done 색 점을 쓴다', () => {
    const { container } = render(<StatusMark status="done" />);
    expect(container.querySelector('[data-dot]')!.className).toContain('bg-done');
  });
});

describe('Stepper', () => {
  it('−/+ 버튼에 aria-label을 붙이고 핸들러를 부른다', async () => {
    const dec = vi.fn();
    const inc = vi.fn();
    render(
      <Stepper label="KEY" value="A" onDec={dec} onInc={inc}
        decLabel="키 반음 내리기" incLabel="키 반음 올리기" />
    );
    await userEvent.click(screen.getByRole('button', { name: '키 반음 내리기' }));
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    expect(dec).toHaveBeenCalledOnce();
    expect(inc).toHaveBeenCalledOnce();
  });

  it('dock 크기는 터치 타깃 44px 이상을 유지한다', () => {
    render(
      <Stepper label="BPM" value="72" size="dock" onDec={() => {}} onInc={() => {}}
        decLabel="BPM 낮추기" incLabel="BPM 높이기" />
    );
    expect(screen.getByRole('button', { name: 'BPM 낮추기' }).className).toContain('h-[44px]');
  });
});

describe('Segmented', () => {
  it('선택된 값에 액센트 배경을 준다', async () => {
    const onChange = vi.fn();
    render(
      <Segmented value="2" onChange={onChange}
        options={[{ value: '1', label: '1단' }, { value: '2', label: '2단' }]} />
    );
    expect(screen.getByRole('button', { name: '2단' }).className).toContain('bg-accent');
    await userEvent.click(screen.getByRole('button', { name: '1단' }));
    expect(onChange).toHaveBeenCalledWith('1');
  });
});

describe('ToolToggle', () => {
  it('켜짐 상태를 aria-pressed로 알린다', () => {
    render(<ToolToggle active onClick={() => {}} icon={<svg aria-hidden="true" />} label="오토스크롤" />);
    expect(screen.getByRole('button', { name: /오토스크롤/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
```

Run: `npm test -- primitives`
Expected: FAIL — 모듈 없음

- [ ] **Step 2: 7개 프리미티브를 구현한다**

`components/ui/MicroLabel.tsx`:

```tsx
import type { ReactNode } from 'react';

const MICRO = 'font-mono text-[10px] tracking-[0.16em] uppercase text-dim';

export function MicroLabel({
  children, as = 'span', htmlFor, className = '',
}: { children: ReactNode; as?: 'span' | 'label'; htmlFor?: string; className?: string }) {
  const cls = `${MICRO} ${className}`.trim();
  if (as === 'label') return <label htmlFor={htmlFor} className={cls}>{children}</label>;
  return <span className={cls}>{children}</span>;
}
```

`components/ui/StatusMark.tsx`:

```tsx
import { STATUS_LABEL, type SongStatus } from '@/lib/types';

const DOT: Record<SongStatus, string> = {
  practicing: 'bg-accent',
  done: 'bg-done',
  archived: 'bg-archived',
};

export function StatusMark({
  status, variant = 'row',
}: { status: SongStatus; variant?: 'row' | 'pill' }) {
  const dot = <span data-dot className={`w-[6px] h-[6px] rounded-full ${DOT[status]}`} />;
  const text = STATUS_LABEL[status];

  if (variant === 'pill') {
    return (
      <span className="flex items-center gap-[7px] text-[12px] text-ink-2 border border-line-chip rounded-pill px-[11px] py-[4px]">
        {dot}{text}
      </span>
    );
  }
  return (
    <span className={`flex items-center gap-2 text-[12.5px] ${status === 'archived' ? 'text-ink-4' : 'text-ink-2'}`}>
      {dot}{text}
    </span>
  );
}
```

`components/ui/Badge.tsx` — 목록 행의 `TAB` / `DROP D` 배지:

```tsx
import type { ReactNode } from 'react';

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'accent' | 'neutral' }) {
  const toneCls = tone === 'accent'
    ? 'text-accent-mute border-accent/35'
    : 'text-ink-4 border-line-strong';
  return (
    <span className={`font-mono text-[9px] font-bold tracking-[0.08em] border rounded-xs px-[5px] py-px ${toneCls}`}>
      {children}
    </span>
  );
}
```

`components/ui/Stepper.tsx` — 컨트롤 바(bar)와 모바일 독(dock) 두 크기:

```tsx
'use client';

import { MicroLabel } from './MicroLabel';

export function Stepper({
  label, value, sub, onDec, onInc, decLabel, incLabel, size = 'bar',
}: {
  label?: string; value: string; sub?: string;
  onDec: () => void; onInc: () => void;
  decLabel: string; incLabel: string; size?: 'bar' | 'dock';
}) {
  const btn = size === 'dock'
    ? 'w-[46px] h-[44px] rounded-[9px] text-[17px]'
    : 'w-[30px] h-[28px] rounded-[6px] text-[16px]';
  const box = size === 'dock'
    ? 'bg-dock-well border-line rounded-[11px] p-[2px] gap-px'
    : 'bg-bg border-line rounded-md p-[3px] gap-[2px]';
  const valueW = size === 'dock' ? 'w-[46px]' : 'min-w-[56px]';

  return (
    <div className={`flex items-center border ${box}`}>
      <button type="button" aria-label={decLabel} onClick={onDec}
        className={`${btn} flex items-center justify-center text-ink-2 cursor-pointer`}>−</button>
      <span className={`${valueW} text-center flex flex-col items-center leading-[1.15]`}>
        <span className="font-mono text-[13px] font-bold text-ink">{value}</span>
        {sub ? <span className="font-mono text-[8.5px] tracking-[0.1em] text-dim">{sub}</span> : null}
      </span>
      <button type="button" aria-label={incLabel} onClick={onInc}
        className={`${btn} flex items-center justify-center text-ink-2 cursor-pointer`}>+</button>
      {label ? <span className="sr-only"><MicroLabel>{label}</MicroLabel></span> : null}
    </div>
  );
}
```

`components/ui/Segmented.tsx`:

```tsx
'use client';

export function Segmented({
  options, value, onChange, grow = false,
}: {
  options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void; grow?: boolean;
}) {
  return (
    <div className={`flex items-center border border-line rounded-lg overflow-hidden ${grow ? 'w-full' : ''}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`h-[32px] px-[13px] text-[13px] cursor-pointer ${grow ? 'grow' : ''} ${
              on ? 'bg-accent text-accent-ink font-bold' : 'bg-transparent text-ink-4 font-medium'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
```

`components/ui/ToolToggle.tsx`:

```tsx
'use client';

import type { ReactNode } from 'react';

export function ToolToggle({
  active, onClick, icon, label, ariaLabel,
}: {
  active: boolean; onClick: () => void; icon: ReactNode;
  label?: string; ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`h-[32px] px-[13px] flex items-center gap-2 rounded-lg border text-[13px] cursor-pointer ${
        active
          ? 'border-accent bg-accent text-accent-ink font-bold'
          : 'border-line bg-transparent text-ink-2 font-medium'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
```

`components/ui/UnderlineField.tsx` — 에디터 메타 영역의 밑줄 입력 래퍼:

```tsx
import type { ReactNode } from 'react';
import { MicroLabel } from './MicroLabel';

export function UnderlineField({
  label, htmlFor, span, children,
}: { label: string; htmlFor: string; span?: number; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[7px]" style={span ? { gridColumn: `span ${span}` } : undefined}>
      <MicroLabel as="label" htmlFor={htmlFor}>{label}</MicroLabel>
      {children}
    </div>
  );
}
```

밑줄 입력 자체의 클래스는 각 화면에서 붙인다 (폰트가 필드마다 다르다 — 제목은 Hahmlet, 수치는 mono):
`h-[34px] p-0 border-0 border-b border-line-strong bg-transparent outline-none text-ink`

Run: `npm test -- primitives`
Expected: PASS

- [ ] **Step 3: 커밋**

```bash
git add components/ui
git commit -m "feat: add UI primitives for design system tokens"
```

---

### Task 5: 카포 프렛보드 SVG와 튜닝 토큰

**Files:**
- Create: `components/song/Fretboard.tsx`
- Create: `components/song/TuningTokens.tsx`
- Test: `components/song/__tests__/fretboard.test.tsx`

**Interfaces:**
- Consumes: Task 2의 `STANDARD_TUNING`
- Produces:
  - `<Fretboard fret: number; size: 'rail' | 'hero' | 'bar' | 'row' | 'editor' />`
  - `capoBarX(size, fret): number | null` (테스트용 export)
  - `<TuningTokens tuning: string; size?: 'rail' | 'hero' | 'editor'; showStringNumbers?: boolean />`

**중요 — 기하 결정:** 아트보드의 카포 바 위치는 크기마다 서로 다른 규칙으로 찍혀 있다(레일 254×46은 "프렛선 바로 뒤", 컨트롤 바 칩 44×18은 그렇지 않다). 여기서는 **레일과 에디터 값에 맞는 한 가지 규칙**으로 통일한다: *카포 바의 오른쪽 끝이 N번 프렛선에서 `barGap`만큼 왼쪽에 놓인다.* 레일(94)·에디터(73) 실측값과 정확히 일치하며, 작은 칩들은 아트보드 대비 몇 px 이동한다. 이 편차는 `NOTES.md`에 적고 디자인 오너에게 확인을 요청한다.

- [ ] **Step 1: 실패 테스트를 쓴다**

`components/song/__tests__/fretboard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { Fretboard, capoBarX } from '@/components/song/Fretboard';
import { TuningTokens } from '@/components/song/TuningTokens';

describe('Fretboard', () => {
  it('레일 크기 2프렛 카포는 아트보드 실측값 x=94에 놓인다', () => {
    expect(capoBarX('rail', 2)).toBe(94);
  });

  it('에디터 크기 2프렛 카포는 아트보드 실측값 x=73에 놓인다', () => {
    expect(capoBarX('editor', 2)).toBe(73);
  });

  it('0프렛이면 카포 바를 그리지 않는다', () => {
    expect(capoBarX('rail', 0)).toBeNull();
    const { container } = render(<Fretboard fret={0} size="rail" />);
    expect(container.querySelector('[data-capo-bar]')).toBeNull();
  });

  it('장식용 SVG는 aria-hidden이다', () => {
    const { container } = render(<Fretboard fret={2} size="bar" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('TuningTokens', () => {
  it('표준 튜닝은 모든 줄을 기본 색으로 둔다', () => {
    const { container } = render(<TuningTokens tuning="E A D G B E" />);
    expect(container.querySelectorAll('[data-changed="true"]')).toHaveLength(0);
  });

  it('Drop D는 바뀐 줄만 앰버로 표시한다', () => {
    const { container } = render(<TuningTokens tuning="D A D G B E" />);
    const changed = container.querySelectorAll('[data-changed="true"]');
    expect(changed).toHaveLength(1);
    expect(changed[0].textContent).toBe('D');
  });

  it('줄번호를 켜면 6→1 순으로 붙는다', () => {
    render(<TuningTokens tuning="E A D G B E" showStringNumbers />);
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
```

Run: `npm test -- fretboard`
Expected: FAIL — 모듈 없음

- [ ] **Step 2: Fretboard를 구현한다**

`components/song/Fretboard.tsx`:

```tsx
export type FretboardSize = 'rail' | 'hero' | 'bar' | 'row' | 'editor';

type Geo = {
  w: number; h: number;
  nutX: number; nutY: number; nutW: number; nutH: number;
  firstFret: number; spacing: number; fretTop: number; fretBottom: number;
  stringX: number; stringTop: number; stringGap: number; stringCount: number; stringWidth: number;
  barW: number; barGap: number; barY: number; barH: number;
  showNumbers: boolean;
};

// 값 출처: docs/design/artboards/SongDetail.dc.html(rail), Main.html(hero),
// 컨트롤 바 칩(bar), MobilePlay.dc.html(row), Editor.html(editor)
const GEO: Record<FretboardSize, Geo> = {
  rail:   { w: 254, h: 46, nutX: 6, nutY: 6, nutW: 5, nutH: 34, firstFret: 58, spacing: 52, fretTop: 6, fretBottom: 40, stringX: 11, stringTop: 9.5, stringGap: 6.8, stringCount: 5, stringWidth: 1.1, barW: 10, barGap: 6, barY: 2, barH: 42, showNumbers: true },
  hero:   { w: 92,  h: 30, nutX: 3, nutY: 2, nutW: 4, nutH: 26, firstFret: 26, spacing: 20, fretTop: 2, fretBottom: 28, stringX: 7,  stringTop: 5,   stringGap: 5,   stringCount: 5, stringWidth: 1,   barW: 7,  barGap: 4, barY: 0, barH: 30, showNumbers: false },
  editor: { w: 200, h: 38, nutX: 4, nutY: 4, nutW: 4, nutH: 30, firstFret: 46, spacing: 42, fretTop: 4, fretBottom: 34, stringX: 8,  stringTop: 7,   stringGap: 6,   stringCount: 5, stringWidth: 1,   barW: 9,  barGap: 6, barY: 1, barH: 36, showNumbers: false },
  bar:    { w: 44,  h: 18, nutX: 2, nutY: 2, nutW: 3, nutH: 14, firstFret: 14, spacing: 12, fretTop: 2, fretBottom: 16, stringX: 5,  stringTop: 4,   stringGap: 3.5, stringCount: 4, stringWidth: 0.8, barW: 5,  barGap: 1, barY: 0, barH: 18, showNumbers: false },
  row:    { w: 34,  h: 16, nutX: 1, nutY: 2, nutW: 2.6, nutH: 12, firstFret: 12, spacing: 10, fretTop: 2, fretBottom: 14, stringX: 4, stringTop: 4,  stringGap: 3,   stringCount: 4, stringWidth: 0.8, barW: 4,  barGap: 1, barY: 0, barH: 16, showNumbers: false },
};

/** 카포 바의 왼쪽 x. 바의 오른쪽 끝이 N번 프렛선에서 barGap만큼 왼쪽에 온다. */
export function capoBarX(size: FretboardSize, fret: number): number | null {
  if (fret <= 0) return null;
  const g = GEO[size];
  const fretLine = g.firstFret + g.spacing * (fret - 1);
  return fretLine - g.barW - g.barGap;
}

export function Fretboard({ fret, size }: { fret: number; size: FretboardSize }) {
  const g = GEO[size];
  const fretCount = 4;
  const barX = capoBarX(size, fret);
  const stringRight = g.w - g.nutX - 2;

  return (
    <svg width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} fill="none" aria-hidden="true">
      <rect x={g.nutX} y={g.nutY} width={g.nutW} height={g.nutH} rx={g.nutW / 2} fill="var(--color-fret-nut)" />
      {Array.from({ length: fretCount }, (_, i) => {
        const x = g.firstFret + g.spacing * i;
        return <path key={i} d={`M${x} ${g.fretTop}v${g.fretBottom - g.fretTop}`} stroke="var(--color-line-strong)" strokeWidth={size === 'rail' ? 1.6 : 1} />;
      })}
      {Array.from({ length: g.stringCount }, (_, i) => {
        const y = g.stringTop + g.stringGap * i;
        return <path key={i} d={`M${g.stringX} ${y}h${stringRight}`} stroke="var(--color-fret-string)" strokeWidth={g.stringWidth} />;
      })}
      {barX !== null ? (
        <rect data-capo-bar x={barX} y={g.barY} width={g.barW} height={g.barH} rx={g.barW / 2} fill="var(--color-accent)" />
      ) : null}
      {g.showNumbers
        ? Array.from({ length: fretCount }, (_, i) => {
            const n = i + 1;
            const cx = g.firstFret + g.spacing * i - g.spacing / 2;
            const on = n === fret;
            return (
              <text key={n} x={cx} y={g.h} fontSize={9} fontWeight={on ? 700 : 400}
                fill={on ? 'var(--color-ink)' : 'var(--color-dim)'}
                fontFamily="var(--font-mono)">{n}</text>
            );
          })
        : null}
    </svg>
  );
}
```

- [ ] **Step 3: TuningTokens를 구현한다**

`components/song/TuningTokens.tsx`:

```tsx
import { STANDARD_TUNING } from '@/lib/types';

const SIZE = {
  rail:   { box: 'w-[28px] h-[28px] text-[13px]', gap: 'gap-[6px]' },
  hero:   { box: 'w-[25px] h-[27px] text-[12.5px]', gap: 'gap-[5px]' },
  editor: { box: 'w-[24px] h-[26px] text-[12px]', gap: 'gap-[5px]' },
};

/** 표준 튜닝과 다른 줄만 앰버로 강조한다. 배열 순서는 6번줄(low E) → 1번줄. */
export function TuningTokens({
  tuning, size = 'rail', showStringNumbers = false,
}: { tuning: string; size?: keyof typeof SIZE; showStringNumbers?: boolean }) {
  const notes = tuning.trim().split(/\s+/);
  const standard = STANDARD_TUNING.split(' ');
  const s = SIZE[size];

  return (
    <span className={`flex items-end ${s.gap}`}>
      {notes.map((note, i) => {
        const changed = note !== standard[i];
        return (
          <span key={i} className="flex flex-col items-center gap-[4px]">
            <span
              data-changed={changed}
              className={`${s.box} flex items-center justify-center border rounded-lg font-mono font-medium ${
                changed ? 'border-accent/35 text-accent' : 'border-line-strong text-ink-2'
              }`}
            >
              {note}
            </span>
            {showStringNumbers ? (
              <span className="font-mono text-[9px] text-hairline">{6 - i}</span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}
```

Run: `npm test -- fretboard`
Expected: PASS

- [ ] **Step 4: 기하 편차를 NOTES.md에 적고 커밋한다**

`docs/design/NOTES.md`를 만들어 다음 줄을 적는다:

```markdown
# 구현 중 발견한 디자인 정본 질문

- 카포 프렛보드의 카포 바 x좌표 규칙이 아트보드마다 다르다. 레일(254×46, x=94)과
  에디터(200×38, x=73)는 "N번 프렛선 바로 뒤"지만, 컨트롤 바 칩(44×18, x=8)과
  모바일 칩(34×16, x=6.5)은 그 규칙을 따르지 않는다. 구현은 레일·에디터 규칙으로
  통일했고 작은 칩은 아트보드 대비 수 px 이동한다. 정본 확인 필요.
- `tokens.css`에 없는 색이 아트보드에 있다: #1A1C22(헤더 경계), #262A33(칩 테두리),
  #5A606C(너트), #2F333C(현), #3A3E47(헤어라인), #33373F(쉼표 글리프), #0F1116(독 안쪽).
  `app/globals.css`의 "아트보드 실측값" 블록에 넣어 뒀다. 정본 편입 여부 확인 필요.
```

```bash
git add components/song docs/design/NOTES.md
git commit -m "feat: add capo fretboard svg and tuning tokens"
```

---

### Task 6: 사이트 헤더와 로그인 화면

**Files:**
- Create: `components/chrome/SiteHeader.tsx`
- Create: `components/chrome/Wordmark.tsx`
- Create: `components/icons.tsx`
- Create: `app/login/page.tsx`
- Test: `components/chrome/__tests__/header.test.tsx`

**Interfaces:**
- Consumes: Task 1 토큰, Task 2 `IS_ADMIN`
- Produces:
  - `<Wordmark />` — 16px 앰버 사각형 + "코드집"(Hahmlet 17/700) 링크
  - `<SiteHeader variant: 'list' | 'detail' | 'editor' | 'bare'; crumb?: string; actions?: ReactNode />`
  - `components/icons.tsx` — `SearchIcon` `ThemeIcon` `PlusIcon` `PlayIcon` `PauseIcon` `MetronomeIcon` `SoundOnIcon` `SoundOffIcon` `FocusIcon` `ChevronLeftIcon` (모두 `aria-hidden="true"`, `currentColor` 기반)

- [ ] **Step 1: 실패 테스트를 쓴다**

`components/chrome/__tests__/header.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { SiteHeader } from '@/components/chrome/SiteHeader';

describe('SiteHeader', () => {
  it('워드마크는 목록으로 가는 링크다', () => {
    render(<SiteHeader variant="list" />);
    expect(screen.getByRole('link', { name: /코드집/ })).toHaveAttribute('href', '/');
  });

  it('아이콘 전용 버튼에 aria-label이 있다', () => {
    render(<SiteHeader variant="list" />);
    expect(screen.getByRole('button', { name: '화면 테마 전환' })).toBeInTheDocument();
  });

  it('detail 변형은 곡 제목을 브레드크럼으로 보여준다', () => {
    render(<SiteHeader variant="detail" crumb="새벽 두 시의 골목" />);
    expect(screen.getByText('새벽 두 시의 골목')).toBeInTheDocument();
  });
});
```

Run: `npm test -- header`
Expected: FAIL

- [ ] **Step 2: 아이콘과 워드마크를 구현한다**

`components/icons.tsx` — 전부 `stroke="currentColor"`로 바꿔 부모 색을 따른다. 아트보드의 path 데이터를 그대로 옮긴다.

```tsx
type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none' as const, 'aria-hidden': true as const,
});

export const SearchIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
  </svg>
);

export const ThemeIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 3v1.5" /><path d="M12 19.5V21" /><path d="M4.9 4.9l1.1 1.1" />
    <path d="M18 18l1.1 1.1" /><path d="M3 12h1.5" /><path d="M19.5 12H21" /><path d="M6 18l-1.1 1.1" /><path d="M19.1 4.9L18 6" />
  </svg>
);

export const PlusIcon = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
    <path d="M12 5v14" /><path d="M5 12h14" />
  </svg>
);

export const PlayIcon = ({ size = 13, className }: IconProps) => (
  <svg {...base(size)} className={className} fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>
);

export const PauseIcon = ({ size = 13, className }: IconProps) => (
  <svg {...base(size)} className={className} fill="currentColor">
    <rect x="6" y="4.5" width="4" height="15" rx="1.2" /><rect x="14" y="4.5" width="4" height="15" rx="1.2" />
  </svg>
);

export const MetronomeIcon = ({ size = 13, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={1.9} strokeLinejoin="round">
    <path d="M9 3h6l4 18H5L9 3Z" /><path d="m12 18 4-11" />
  </svg>
);

export const SoundOnIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M16 9a4 4 0 0 1 0 6" /><path d="M19 6.5a8 8 0 0 1 0 11" />
  </svg>
);

export const SoundOffIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m17 9 4 6" /><path d="m21 9-4 6" />
  </svg>
);

export const FocusIcon = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9V5a2 2 0 0 1 2-2h4" /><path d="M15 3h4a2 2 0 0 1 2 2v4" />
    <path d="M21 15v4a2 2 0 0 1-2 2h-4" /><path d="M9 21H5a2 2 0 0 1-2-2v-4" />
  </svg>
);

export const ChevronLeftIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);
```

`components/chrome/Wordmark.tsx`:

```tsx
import Link from 'next/link';

export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-[10px] no-underline text-ink">
      <span className="w-4 h-4 rounded-[4px] bg-accent block" />
      <span className="font-display text-[17px] font-bold tracking-[-0.01em]">코드집</span>
    </Link>
  );
}
```

- [ ] **Step 3: SiteHeader를 구현한다**

`components/chrome/SiteHeader.tsx` — 데스크톱 헤더 60px. `md` 미만에서는 감추고 화면별 모바일 상단을 쓴다.

```tsx
import type { ReactNode } from 'react';
import { Wordmark } from './Wordmark';
import { ThemeIcon } from '@/components/icons';

export function SiteHeader({
  variant, crumb, actions,
}: { variant: 'list' | 'detail' | 'editor' | 'bare'; crumb?: string; actions?: ReactNode }) {
  const bordered = variant !== 'bare';

  return (
    <header
      className={`hidden md:flex shrink-0 h-[60px] px-[48px] items-center gap-[20px] ${
        bordered ? 'border-b border-line-header' : ''
      }`}
    >
      <Wordmark />

      {variant === 'list' ? (
        <span className="font-mono text-[11px] tracking-[0.12em] text-dim">PERSONAL ARCHIVE</span>
      ) : null}

      {crumb ? (
        <>
          <span className="text-hairline">/</span>
          <span className="text-[13px] text-ink-4">{crumb}</span>
        </>
      ) : null}

      <div className="ml-auto flex items-center gap-[10px]">
        {actions}
        {variant !== 'bare' ? (
          <button
            type="button"
            aria-label="화면 테마 전환"
            className="w-[36px] h-[36px] flex items-center justify-center bg-surface-2 border border-line rounded-md text-ink-3 cursor-pointer"
          >
            <ThemeIcon />
          </button>
        ) : null}
      </div>
    </header>
  );
}
```

주의: 테마 버튼은 이번 범위에서 **표시만** 한다. 라이트 모드 토큰이 아직 없다(`tokens.css` F-10 남은 작업). 클릭 핸들러를 붙이지 않는다.

- [ ] **Step 4: `/login` 화면을 만든다**

`app/login/page.tsx` — 아트보드 `Login.html` 수치 그대로. 상단 방사형 글로우는 이 화면에만 쓰는 유일한 예외다.

```tsx
import Link from 'next/link';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { MicroLabel } from '@/components/ui/MicroLabel';

export default function LoginPage() {
  return (
    <div className="relative min-h-dvh flex flex-col bg-bg overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'radial-gradient(680px 340px at 50% 22%, rgba(255,157,77,0.11), rgba(255,157,77,0) 72%)' }}
      />

      <div className="relative">
        <SiteHeader variant="bare" />
      </div>

      <main className="relative grow flex flex-col items-center justify-center gap-[40px] px-5 pb-[70px]">
        <div className="flex flex-col items-center gap-[14px] text-center">
          <span className="font-mono text-[11px] tracking-[0.22em] text-accent">ADMIN ACCESS</span>
          <h1 className="m-0 font-display text-[36px] md:text-[52px] font-bold tracking-[-0.035em] leading-none">
            한 사람을 위한 서랍
          </h1>
          <p className="m-0 text-[14.5px] text-ink-4">읽는 건 누구나. 쓰고 고치고 지우는 건 나만.</p>
        </div>

        <form className="w-full max-w-[380px] flex flex-col gap-[26px]">
          <div className="flex flex-col gap-[9px]">
            <MicroLabel as="label" htmlFor="pw">PASSWORD</MicroLabel>
            <input
              id="pw"
              type="password"
              autoComplete="current-password"
              className="h-[44px] p-0 border-0 border-b border-line-strong bg-transparent font-mono text-[20px] tracking-[0.14em] text-ink outline-none"
            />
          </div>

          <div className="flex items-center gap-[10px]">
            <input id="keep" type="checkbox" defaultChecked className="w-4 h-4 accent-accent" />
            <label htmlFor="keep" className="text-[13px] text-ink-4">30일 동안 로그인 유지</label>
          </div>

          <button
            type="submit"
            className="h-[48px] border-0 rounded-[10px] bg-accent text-accent-ink text-[15px] font-bold cursor-pointer"
          >
            로그인
          </button>

          <div className="flex items-center justify-between pt-[6px] border-t border-line-header">
            <Link href="/" className="text-[13px] no-underline pt-4">← 곡 목록으로</Link>
            <span className="font-mono text-[11px] text-faint pt-4">SINGLE ACCOUNT</span>
          </div>
        </form>
      </main>
    </div>
  );
}
```

제출 동작은 없다 (인증은 추후 적용). `onSubmit`을 붙이지 않고 서버 컴포넌트로 둔다.

Run: `npm test -- header` 그리고 `npm run dev` 후 `/login` 육안 확인
Expected: 테스트 PASS, 화면이 아트보드와 일치

- [ ] **Step 5: 커밋**

```bash
git add components/chrome components/icons.tsx app/login
git commit -m "feat: add site header, icons and login screen"
```

---

### Task 7: 곡 목록 `/` — 데스크톱 트랙리스트 + 모바일

**Files:**
- Create: `components/song/ContinueCard.tsx`
- Create: `components/song/TrackList.tsx`
- Create: `components/song/FilterChips.tsx`
- Modify: `app/page.tsx` (Task 1의 임시 페이지를 교체)
- Test: `components/song/__tests__/tracklist.test.tsx`

**Interfaces:**
- Consumes: Task 2 `MOCK_SONGS` `MOCK_STATS` `CONTINUE_SONG` `IS_ADMIN`, Task 4 `StatusMark` `Badge` `MicroLabel`, Task 5 `Fretboard` `TuningTokens`, Task 6 `SiteHeader`
- Produces:
  - `<TrackList songs: SongSummary[] />` — 데스크톱 그리드 행 + 모바일 68px 행을 한 컴포넌트에서 반응형으로
  - `<ContinueCard song: Song />`
  - `<FilterChips groups: {label: string; items: string[]}[] />` — 표시 전용(선택 상태는 첫 항목 고정)

- [ ] **Step 1: 실패 테스트를 쓴다**

`components/song/__tests__/tracklist.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import { TrackList } from '@/components/song/TrackList';
import { MOCK_SONGS } from '@/lib/mock/songs';

describe('TrackList', () => {
  it('행 전체가 곡 상세로 가는 링크다', () => {
    render(<TrackList songs={MOCK_SONGS} />);
    const first = screen.getByRole('link', { name: /새벽 두 시의 골목/ });
    expect(first).toHaveAttribute('href', '/songs/saebyeok-du-siui-golmok');
  });

  it('TAB이 있는 곡에 TAB 배지를 붙인다', () => {
    render(<TrackList songs={MOCK_SONGS} />);
    const row = screen.getByRole('link', { name: /새벽 두 시의 골목/ });
    expect(within(row).getByText('TAB')).toBeInTheDocument();
  });

  it('비표준 튜닝 곡에 DROP D 배지를 붙인다', () => {
    render(<TrackList songs={MOCK_SONGS} />);
    const row = screen.getByRole('link', { name: /겨울 정류장/ });
    expect(within(row).getByText('DROP D')).toBeInTheDocument();
  });

  it('카포 0은 —로 표시한다', () => {
    render(<TrackList songs={MOCK_SONGS} />);
    const row = screen.getByRole('link', { name: /늦은 편지/ });
    expect(within(row).getByText('—')).toBeInTheDocument();
  });

  it('번호는 2자리로 채운다', () => {
    render(<TrackList songs={MOCK_SONGS} />);
    expect(screen.getByText('01')).toBeInTheDocument();
  });
});
```

Run: `npm test -- tracklist`
Expected: FAIL

- [ ] **Step 2: TrackList를 구현한다**

`components/song/TrackList.tsx`. 데스크톱 그리드 컬럼은 정본 그대로 `36px | minmax(0,1fr) | 64px | 92px | 104px | 84px`, gap 16px, 행 높이 62px. 모바일은 같은 데이터를 68px flex 행으로 보여준다.

```tsx
import Link from 'next/link';
import type { Song } from '@/lib/types';
import { STANDARD_TUNING } from '@/lib/types';
import { StatusMark } from '@/components/ui/StatusMark';
import { Badge } from '@/components/ui/Badge';
import { MicroLabel } from '@/components/ui/MicroLabel';

const GRID = 'grid-cols-[36px_minmax(0,1fr)_64px_92px_104px_84px] gap-4';

function tuningBadge(tuning: string): string | null {
  if (tuning === STANDARD_TUNING) return null;
  const notes = tuning.split(' ');
  const std = STANDARD_TUNING.split(' ');
  if (notes[0] === 'D' && notes.slice(1).join(' ') === std.slice(1).join(' ')) return 'DROP D';
  return '비표준';
}

function mobileMeta(song: Song): string {
  const parts = [song.artist];
  if (song.capo > 0) parts.push(`CAPO ${song.capo}프렛`);
  if (song.hasTab) parts.push('TAB');
  const badge = tuningBadge(song.tuning);
  if (badge) parts.push(badge);
  return parts.join(' · ');
}

export function TrackList({ songs }: { songs: Song[] }) {
  return (
    <div className="flex flex-col">
      {/* 데스크톱 헤더 행 */}
      <div className={`hidden md:grid ${GRID} items-center h-[30px] px-5 border-b border-line font-mono text-[10px] tracking-[0.14em] text-dim`}>
        <span>#</span>
        <span>TITLE</span>
        <span className="text-center">KEY</span>
        <span>CAPO</span>
        <span>STATUS</span>
        <span className="text-right">UPDATED</span>
      </div>

      {songs.map((song, i) => {
        const num = String(i + 1).padStart(2, '0');
        const badge = tuningBadge(song.tuning);
        return (
          <Link
            key={song.slug}
            href={`/songs/${song.slug}`}
            className="no-underline text-ink border-b border-line-hair"
          >
            {/* 데스크톱 행 62px */}
            <span className={`hidden md:grid ${GRID} items-center h-[62px] px-5`}>
              <span className="font-mono text-[12px] text-dim">{num}</span>
              <span className="flex items-baseline gap-[10px] min-w-0">
                <span className="font-display text-[17px] font-semibold tracking-[-0.015em]">{song.title}</span>
                <span className="text-[13px] text-ink-4">{song.artist}</span>
                {song.hasTab ? <Badge tone="accent">TAB</Badge> : null}
                {badge ? <Badge>{badge}</Badge> : null}
              </span>
              <span className="font-mono text-[12.5px] font-medium text-ink-2 border border-line-chip rounded-[6px] py-1 text-center">
                {song.key}
              </span>
              <span className={`font-mono text-[11.5px] ${song.capo > 0 ? 'text-ink-4' : 'text-dim'}`}>
                {song.capo > 0 ? `${song.capo}프렛` : '—'}
              </span>
              <StatusMark status={song.status} />
              <span className="font-mono text-[11.5px] text-dim text-right">{song.updatedLabel}</span>
            </span>

            {/* 모바일 행 68px */}
            <span className="flex md:hidden items-center gap-[14px] h-[68px]">
              <span className="font-mono text-[11.5px] text-dim w-5">{num}</span>
              <span className="flex flex-col gap-[3px] grow min-w-0">
                <span className="font-display text-[17px] font-semibold tracking-[-0.015em] truncate">{song.title}</span>
                <span className="font-mono text-[11px] text-ink-5 truncate">{mobileMeta(song)}</span>
              </span>
              <StatusMark status={song.status} variant="row" />
              <span className="shrink-0 font-mono text-[13px] font-medium text-ink-2 w-[30px] text-right">{song.key}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
```

주의: 모바일 행의 `StatusMark`는 점만 필요하지만, 스크린 리더에는 텍스트가 있는 편이 낫다. 시각적으로 텍스트를 숨기려면 `variant="row"` 대신 점만 렌더링하고 `<span className="sr-only">`로 상태를 읽어 준다 — 아트보드에는 점만 있으므로 그 형태를 따르되 `sr-only` 텍스트를 남긴다.

- [ ] **Step 3: ContinueCard와 FilterChips를 구현한다**

`components/song/ContinueCard.tsx` — 히어로 카드. 우측 세로 구분선 블록 3개 + 연주 시작 버튼.

```tsx
import Link from 'next/link';
import type { Song } from '@/lib/types';
import { STANDARD_TUNING } from '@/lib/types';
import { MicroLabel } from '@/components/ui/MicroLabel';
import { TuningTokens } from '@/components/song/TuningTokens';
import { Fretboard } from '@/components/song/Fretboard';
import { PlayIcon } from '@/components/icons';

export function ContinueCard({ song }: { song: Song }) {
  return (
    <section className="shrink-0 bg-surface-2 border border-line rounded-xl p-[26px_30px] flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-9">
      <div className="flex flex-col gap-[9px] grow min-w-0">
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-accent">CONTINUE PRACTICE</span>
        <h2 className="m-0 font-display text-[30px] font-bold tracking-[-0.025em] leading-[1.2]">{song.title}</h2>
        <div className="flex items-center gap-[10px]">
          <span className="text-[14px] text-ink-3">{song.artist}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-hairline" />
          <span className="text-[12.5px] text-ink-4">{song.updatedLabel} · {song.status === 'practicing' ? '연습 중' : '보관'}</span>
        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-[7px] items-center px-[22px] border-l border-line">
        <MicroLabel className="tracking-[0.14em]">ORIGINAL KEY</MicroLabel>
        <span className="font-mono text-[30px] font-bold leading-none text-ink">{song.key}</span>
      </div>

      <div className="shrink-0 flex flex-col gap-[9px] items-center px-[22px] border-l border-r border-line">
        <MicroLabel className="tracking-[0.14em]">TUNING</MicroLabel>
        <TuningTokens tuning={song.tuning} size="hero" />
        <span className="text-[11px] text-dim">{song.tuning === STANDARD_TUNING ? '표준' : '비표준'}</span>
      </div>

      <div className="shrink-0 flex flex-col gap-[9px] items-center">
        <MicroLabel className="tracking-[0.14em]">CAPO</MicroLabel>
        <Fretboard fret={song.capo} size="hero" />
        <span className="font-mono text-[12px] font-medium text-ink-2">
          {song.capo > 0 ? `${song.capo}프렛` : '카포 없음'}
        </span>
      </div>

      <Link
        href={`/songs/${song.slug}`}
        className="shrink-0 h-[44px] flex items-center gap-2 px-5 bg-accent text-accent-ink rounded-[10px] text-[14px] font-bold no-underline"
      >
        <PlayIcon size={14} />연주 시작
      </Link>
    </section>
  );
}
```

`components/song/FilterChips.tsx` — 이번 범위에서는 **표시 전용**이다(검색·필터는 탐색 단계).

```tsx
'use client';

import { useState } from 'react';

export function FilterChips({ groups }: { groups: { items: string[] }[] }) {
  const [active, setActive] = useState('전체');
  return (
    <div className="flex items-center gap-2 flex-wrap overflow-x-auto">
      {groups.map((g, gi) => (
        <span key={gi} className="flex items-center gap-2">
          {gi > 0 ? <span className="w-px h-[18px] bg-line mx-[6px] hidden md:block" /> : null}
          {g.items.map((item) => {
            const on = item === active;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(item)}
                className={`shrink-0 h-[32px] md:h-[32px] px-[13px] rounded-lg border text-[13px] cursor-pointer ${
                  on ? 'border-accent bg-accent/12 text-accent font-bold' : 'border-line bg-transparent text-ink-3'
                }`}
              >
                {item}
              </button>
            );
          })}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: `/` 페이지를 조립한다**

`app/page.tsx`:

```tsx
import Link from 'next/link';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { Wordmark } from '@/components/chrome/Wordmark';
import { ContinueCard } from '@/components/song/ContinueCard';
import { TrackList } from '@/components/song/TrackList';
import { FilterChips } from '@/components/song/FilterChips';
import { SearchIcon, ThemeIcon, PlusIcon } from '@/components/icons';
import { MOCK_SONGS, MOCK_STATS, CONTINUE_SONG } from '@/lib/mock/songs';
import { IS_ADMIN } from '@/lib/mock/flags';

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <SiteHeader
        variant="list"
        actions={
          <>
            <div className="w-[280px] relative flex items-center">
              <SearchIcon className="absolute left-3 text-ink-5" />
              <label htmlFor="q" className="sr-only">곡 검색</label>
              <input
                id="q" type="search" placeholder="제목 · 아티스트"
                className="w-full h-[36px] pl-9 pr-3 border border-line rounded-md bg-surface-2 text-[13.5px] text-ink outline-none"
              />
            </div>
            {IS_ADMIN ? (
              <Link
                href="/songs/new"
                className="h-[36px] flex items-center gap-[7px] px-4 bg-accent text-accent-ink rounded-md text-[13.5px] font-bold no-underline"
              >
                <PlusIcon />새 곡
              </Link>
            ) : null}
          </>
        }
      />

      {/* 모바일 상단 — 상태바 자리 52px를 비워 둔다 */}
      <header className="md:hidden shrink-0 pt-[56px] px-5 pb-4 flex flex-col gap-[18px]">
        <div className="flex items-center gap-[10px]">
          <Wordmark />
          <button
            type="button" aria-label="화면 테마 전환"
            className="ml-auto w-11 h-11 flex items-center justify-center border-0 bg-transparent text-ink-3 cursor-pointer"
          >
            <ThemeIcon size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-[0.18em] text-accent">{MOCK_STATS.total} SONGS</span>
          <h1 className="m-0 font-display text-[32px] font-bold tracking-[-0.03em] leading-none">내 코드 악보</h1>
        </div>
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-[14px] text-ink-5" />
          <label htmlFor="mq" className="sr-only">곡 검색</label>
          <input
            id="mq" type="search" placeholder="제목 · 아티스트"
            className="w-full h-[46px] pl-10 pr-[14px] border border-line rounded-lg bg-surface-2 text-[15px] text-ink outline-none"
          />
        </div>
      </header>

      <main className="grow flex flex-col gap-[26px] px-5 md:px-[48px] pt-0 md:pt-10 pb-[44px]">
        <div className="hidden md:flex items-end justify-between gap-6">
          <div className="flex flex-col gap-[10px]">
            <span className="font-mono text-[11px] tracking-[0.16em] text-accent">
              {MOCK_STATS.total} SONGS · {MOCK_STATS.practicing} IN PRACTICE
            </span>
            <h1 className="m-0 font-display text-[46px] font-bold tracking-[-0.03em] leading-none">내 코드 악보</h1>
          </div>
          <div className="flex items-center gap-[10px] pb-[6px]">
            <label htmlFor="sort" className="font-mono text-[11px] tracking-[0.1em] text-dim">SORT</label>
            <select id="sort" className="h-[34px] px-[10px] border border-line rounded-lg bg-surface-2 text-[13px] text-ink-2">
              <option>최근 수정순</option><option>제목순</option><option>등록순</option>
            </select>
          </div>
        </div>

        <div className="hidden md:block">
          <ContinueCard song={CONTINUE_SONG} />
        </div>

        <FilterChips groups={[{ items: ['전체', '포크', '발라드', '시티팝'] }, { items: ['연습중', '완성', '보관'] }]} />

        <TrackList songs={MOCK_SONGS} />
      </main>

      {IS_ADMIN ? (
        <Link
          href="/songs/new"
          aria-label="새 곡 등록"
          className="md:hidden fixed right-5 bottom-[30px] w-14 h-14 rounded-[18px] bg-accent text-accent-ink flex items-center justify-center no-underline shadow-fab"
        >
          <PlusIcon size={22} />
        </Link>
      ) : null}
    </div>
  );
}
```

Run: `npm test -- tracklist` · `npm run dev` 후 1440px와 390px 두 폭에서 육안 확인
Expected: 테스트 PASS, 두 폭 모두 아트보드와 일치

- [ ] **Step 5: 커밋**

```bash
git add components/song app/page.tsx
git commit -m "feat: add song list screen with tracklist and continue card"
```

---

### Task 8: 악보 시트 렌더러

**Files:**
- Create: `components/sheet/Sheet.tsx`
- Create: `components/sheet/ChordLine.tsx`
- Create: `components/sheet/SectionLabel.tsx`
- Create: `components/sheet/CommentBlock.tsx`
- Create: `components/sheet/TabBlock.tsx`
- Test: `components/sheet/__tests__/sheet.test.tsx`

**Interfaces:**
- Consumes: Task 2 `Block` `Pair`, Task 3 `transposeChord`
- Produces:
  - `<Sheet blocks: Block[]; semi: number; fontSize: number; cols: 1 | 2; errorLines?: number[]; containerRef?: Ref<HTMLDivElement> />` — `strum` 블록은 걸러낸다(패턴은 시트 밖 카드에서 따로 렌더링). `containerRef`는 **실제로 스크롤되는 루트 div**에 붙는다 — Task 13·14의 오토스크롤이 이 ref를 잡는다.
  - `<ChordLine pairs: Pair[]; semi: number; hasError?: boolean />`
  - `<SectionLabel label: string />`, `<CommentBlock text: string />`, `<TabBlock title repeat lines />`
  - `sheetBlocks(blocks): Block[]` — strum을 제외한 렌더 대상, `strumBlocks(blocks)` — strum만

- [ ] **Step 1: 실패 테스트를 쓴다**

`components/sheet/__tests__/sheet.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { Sheet, sheetBlocks, strumBlocks } from '@/components/sheet/Sheet';
import { ChordLine } from '@/components/sheet/ChordLine';
import { TabBlock } from '@/components/sheet/TabBlock';
import type { Block } from '@/lib/types';

const BLOCKS: Block[] = [
  { k: 'strum', use: 'Verse', slots: Array.from({ length: 16 }, () => ({ stroke: null, accent: false })) },
  { k: 'label', label: 'Verse 1' },
  { k: 'line', pairs: [{ chord: 'G', text: '가로등 하나 ' }, { chord: 'Em', text: '꺼지고' }] },
  { k: 'comment', text: '손목 힘 빼고' },
  { k: 'tab', title: '메인 리프', repeat: '×3', lines: ['--10--', '------', '------', '------', '------', '------'] },
];

describe('sheetBlocks', () => {
  it('strum 블록은 시트에서 빼고 따로 넘긴다', () => {
    expect(sheetBlocks(BLOCKS).some((b) => b.k === 'strum')).toBe(false);
    expect(strumBlocks(BLOCKS)).toHaveLength(1);
  });
});

describe('ChordLine', () => {
  it('가사 조각 끝의 공백을 보존한다 — 그 공백이 코드 간격을 만든다', () => {
    const { container } = render(
      <ChordLine semi={0} pairs={[{ chord: 'G', text: '가로등 하나 ' }]} />
    );
    expect(container.querySelector('.lyric')!.textContent).toBe('가로등 하나 ');
  });

  it('semi만큼 이조해서 코드를 보여준다', () => {
    render(<ChordLine semi={2} pairs={[{ chord: 'Am7', text: '우린' }]} />);
    expect(screen.getByText('Bm7')).toBeInTheDocument();
  });

  it('코드가 없는 조각도 높이를 차지해 줄이 흔들리지 않는다', () => {
    const { container } = render(<ChordLine semi={0} pairs={[{ chord: null, text: '가사만' }]} />);
    expect(container.querySelector('.chord')).toBeInTheDocument();
  });

  it('오류 줄에는 danger 좌측 바를 붙인다', () => {
    const { container } = render(<ChordLine semi={0} hasError pairs={[{ chord: null, text: '깨진 줄' }]} />);
    expect(container.firstElementChild!.className).toContain('border-danger');
  });
});

describe('TabBlock', () => {
  it('6줄을 줄 이름과 함께 그대로 보존한다', () => {
    const { container } = render(<TabBlock title="메인 리프" repeat="×3" lines={['--10--', '-', '-', '-', '-', '-']} />);
    const rows = container.querySelectorAll('[data-tab-row]');
    expect(rows).toHaveLength(6);
    expect(rows[0].textContent).toContain('--10--');
    expect(screen.getByText('×3')).toBeInTheDocument();
  });

  it('TAB은 이조하지 않는다 — semi를 받지 않는다', () => {
    render(<Sheet blocks={BLOCKS} semi={5} fontSize={18} cols={2} />);
    expect(screen.getByText(/--10--/)).toBeInTheDocument();
  });
});
```

Run: `npm test -- sheet`
Expected: FAIL

- [ ] **Step 2: 블록 컴포넌트 4종을 구현한다**

`components/sheet/ChordLine.tsx`:

```tsx
import type { Pair } from '@/lib/types';
import { transposeChord } from '@/lib/chordpro/transpose';

export function ChordLine({
  pairs, semi, hasError = false,
}: { pairs: Pair[]; semi: number; hasError?: boolean }) {
  return (
    <div className={`gc-line ${hasError ? 'border-l-2 border-danger bg-danger/7 pl-3 py-[6px]' : ''}`}>
      {pairs.map((p, i) => (
        <span key={i} className="gc-pair">
          <span className="chord">{p.chord ? transposeChord(p.chord, semi) : ''}</span>
          <span className="lyric">{p.text}</span>
        </span>
      ))}
    </div>
  );
}
```

`components/sheet/SectionLabel.tsx`:

```tsx
export function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-[18px_10px]">
      <span className="font-mono text-[0.62em] font-bold tracking-[0.18em] uppercase text-ink-5">{label}</span>
      <span className="grow h-px bg-line-grid" />
    </div>
  );
}
```

`components/sheet/CommentBlock.tsx`:

```tsx
export function CommentBlock({ text }: { text: string }) {
  return (
    <div className="text-[0.76em] text-ink-5 border-l-2 border-line-strong pl-3 my-3">{text}</div>
  );
}
```

`components/sheet/TabBlock.tsx` — 붙여넣은 아스키를 **그대로 보존**한다. 대시 개수를 정규화하거나 정렬을 재계산하지 않는다.

```tsx
const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E'];

export function TabBlock({
  title, repeat, lines,
}: { title: string; repeat: string; lines: string[] }) {
  return (
    <div className="bg-bg border border-line-grid rounded-[10px] p-[11px_13px] my-2 flex flex-col gap-[7px]">
      <div className="flex items-center gap-[9px]">
        <span className="font-mono text-[0.52em] font-bold tracking-[0.16em] text-accent">TAB</span>
        <span className="text-[0.66em] text-ink-3">{title}</span>
        {repeat ? (
          <span className="ml-auto font-mono text-[0.58em] font-bold text-ink-2 border border-line-strong rounded-xs px-[7px] py-[2px]">
            {repeat}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col">
        {lines.map((t, i) => (
          <span key={i} data-tab-row className="flex font-mono text-[0.66em] leading-[1.6]">
            <span className="w-[1.3em] text-ink-5">{STRING_NAMES[i] ?? ''}</span>
            <span className="text-faint">|</span>
            <span className="whitespace-pre text-tab">{t}</span>
            <span className="text-faint">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Sheet 컨테이너를 구현한다**

`components/sheet/Sheet.tsx` — 글자 크기는 컨테이너 `font-size`만 바꾸고 내부는 전부 `em`이 따라간다. 단수는 `column-count`.

```tsx
import type { Ref } from 'react';
import type { Block } from '@/lib/types';
import { ChordLine } from './ChordLine';
import { SectionLabel } from './SectionLabel';
import { CommentBlock } from './CommentBlock';
import { TabBlock } from './TabBlock';

/** 스트러밍 패턴은 시트 밖 카드에서 따로 렌더링한다 */
export function sheetBlocks(blocks: Block[]) {
  return blocks.filter((b) => b.k !== 'strum');
}

export function strumBlocks(blocks: Block[]) {
  return blocks.filter((b): b is Extract<Block, { k: 'strum' }> => b.k === 'strum');
}

export function Sheet({
  blocks, semi, fontSize, cols, errorLines = [], containerRef,
}: {
  blocks: Block[]; semi: number; fontSize: number; cols: 1 | 2;
  errorLines?: number[]; containerRef?: Ref<HTMLDivElement>;
}) {
  let lineIndex = 0;

  return (
    <div
      ref={containerRef}
      className={`grow bg-surface border border-line-soft rounded-xl p-[30px_36px] overflow-x-hidden ${
        cols === 1 ? 'overflow-y-auto' : 'overflow-y-hidden'
      }`}
    >
      <div
        style={{
          fontSize: `${fontSize}px`,
          columnCount: cols,
          columnGap: '60px',
          columnRule: '1px solid var(--color-line-soft)',
        }}
      >
        {sheetBlocks(blocks).map((b, i) => {
          const key = `${b.k}-${i}`;
          if (b.k === 'line') {
            const n = lineIndex++;
            return (
              <div key={key} className="break-inside-avoid mb-3">
                <ChordLine pairs={b.pairs} semi={semi} hasError={errorLines.includes(n)} />
              </div>
            );
          }
          return (
            <div key={key} className="break-inside-avoid mb-3">
              {b.k === 'label' ? <SectionLabel label={b.label} /> : null}
              {b.k === 'comment' ? <CommentBlock text={b.text} /> : null}
              {b.k === 'tab' ? <TabBlock title={b.title} repeat={b.repeat} lines={b.lines} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

Run: `npm test -- sheet`
Expected: PASS

- [ ] **Step 4: 커밋**

```bash
git add components/sheet
git commit -m "feat: add chord sheet renderer for block types"
```

---

### Task 9: 스트러밍 그리드

**Files:**
- Create: `components/sheet/StrumGrid.tsx`
- Test: `components/sheet/__tests__/strum.test.tsx`

**Interfaces:**
- Consumes: Task 2 `Slot`
- Produces: `<StrumGrid name: string; use: string; slots: Slot[]; size?: 'desktop' | 'mobile' />` — 칸당 25px(데스크톱) / 20px(모바일)
- Produces: `patternName(index: number): string` — 0 → `PATTERN A`, 1 → `PATTERN B`

- [ ] **Step 1: 실패 테스트를 쓴다**

`components/sheet/__tests__/strum.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { StrumGrid, patternName } from '@/components/sheet/StrumGrid';
import type { Slot } from '@/lib/types';

function slots(spec: string, accents: number[]): Slot[] {
  return Array.from({ length: 16 }, (_, i) => ({
    stroke: spec[i] === 'D' ? 'D' : spec[i] === 'U' ? 'U' : null,
    accent: accents.includes(i),
  }));
}

describe('StrumGrid', () => {
  it('칸을 정확히 16개 그린다', () => {
    const { container } = render(
      <StrumGrid name="PATTERN A" use="Verse" slots={slots('D-D-DUD-D-D-DU--', [4, 12])} />
    );
    expect(container.querySelectorAll('[data-slot]')).toHaveLength(16);
  });

  it('박 칸 라벨은 1 2 3 4다', () => {
    render(<StrumGrid name="PATTERN A" use="Verse" slots={slots('D---D---D---D---', [])} />);
    for (const n of ['1', '2', '3', '4']) {
      expect(screen.getAllByText(n).length).toBeGreaterThan(0);
    }
  });

  it('다운은 ↓, 업은 ↑, 쉼은 ·로 표시한다 — 입력은 D/U/-다', () => {
    const { container } = render(
      <StrumGrid name="PATTERN A" use="Verse" slots={slots('DU--------------', [])} />
    );
    const cells = container.querySelectorAll('[data-slot]');
    expect(cells[0].textContent).toContain('↓');
    expect(cells[1].textContent).toContain('↑');
    expect(cells[2].textContent).toContain('·');
  });

  it('강세 칸에는 앰버 하단 바를 붙인다', () => {
    const { container } = render(
      <StrumGrid name="PATTERN A" use="Verse" slots={slots('D-D-D-D-D-D-D-D-', [4])} />
    );
    const bars = container.querySelectorAll('[data-accent-bar="true"]');
    expect(bars).toHaveLength(1);
  });

  it('첫 칸을 뺀 박 칸에 좌측 구분선을 넣는다', () => {
    const { container } = render(
      <StrumGrid name="PATTERN A" use="Verse" slots={slots('D---D---D---D---', [])} />
    );
    expect(container.querySelectorAll('[data-beat-divider="true"]')).toHaveLength(3);
  });
});

describe('patternName', () => {
  it('순서대로 A, B를 붙인다', () => {
    expect(patternName(0)).toBe('PATTERN A');
    expect(patternName(1)).toBe('PATTERN B');
  });
});
```

Run: `npm test -- strum`
Expected: FAIL

- [ ] **Step 2: 구현한다**

`components/sheet/StrumGrid.tsx`:

```tsx
import type { Slot } from '@/lib/types';

const LABELS = ['1', 'e', '&', 'a', '2', 'e', '&', 'a', '3', 'e', '&', 'a', '4', 'e', '&', 'a'];

export function patternName(index: number): string {
  return `PATTERN ${String.fromCharCode(65 + index)}`;
}

export function StrumGrid({
  name, use, slots, size = 'desktop',
}: { name: string; use: string; slots: Slot[]; size?: 'desktop' | 'mobile' }) {
  const cell = size === 'desktop' ? 25 : 20;

  return (
    <div className="grow flex flex-col gap-[9px] bg-surface border border-line-soft rounded-[14px] p-[14px_16px]">
      <div className="flex items-baseline gap-[9px] min-w-0">
        <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-accent shrink-0">{name}</span>
        <span className="text-[11.5px] text-ink-4 truncate">{use}</span>
      </div>
      <div className="flex bg-bg border border-line-grid rounded-[10px] p-[10px_8px]">
        {slots.map((s, i) => {
          const isBeat = i % 4 === 0;
          const divider = isBeat && i > 0;
          const glyph = s.stroke === 'D' ? '↓' : s.stroke === 'U' ? '↑' : '·';
          const isRest = s.stroke === null;
          return (
            <span
              key={i}
              data-slot
              data-beat-divider={divider}
              style={{ width: cell }}
              className={`flex flex-col items-center gap-[7px] ${divider ? 'border-l border-line-grid' : ''}`}
            >
              <span className={`font-mono text-[10px] ${isBeat ? 'text-ink-3 font-bold' : 'text-faint'}`}>
                {LABELS[i]}
              </span>
              <span
                className={`leading-none ${isRest ? 'text-[13px] text-rest' : 'text-[18px]'} ${
                  !isRest && s.accent ? 'text-accent font-bold' : !isRest ? 'text-lyric' : ''
                }`}
              >
                {glyph}
              </span>
              <span
                data-accent-bar={s.accent}
                className={`w-[14px] h-[2px] rounded-[1px] ${s.accent ? 'bg-accent' : 'bg-transparent'}`}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}
```

Run: `npm test -- strum`
Expected: PASS

- [ ] **Step 3: 커밋**

```bash
git add components/sheet/StrumGrid.tsx
git commit -m "feat: add strumming pattern grid"
```

---

### Task 10: `usePlayView` — 연주 뷰 화면 상태 전부

이 훅이 이번 계획에서 로직이 모인 유일한 곳이다. 데스크톱 컨트롤 바와 모바일 독이 같은 훅을 쓴다.

**Files:**
- Create: `lib/ui/playView.ts`
- Test: `lib/ui/__tests__/playView.test.ts`

**Interfaces:**
- Consumes: 없음 (순수 React 상태)
- Produces: `usePlayView({ tempo: number; initialSemi?: number })` 가 돌려주는 객체
  - 키: `semi`, `keyUp()`, `keyDown()`, `keyReset()` — `semi`는 −11~+11
  - 글자: `fontSize`, `fontUp()`, `fontDown()` — 13~30px
  - 단수: `cols` (1 | 2), `setCols(n)`
  - 집중 모드: `focus`, `toggleFocus()`
  - 오토스크롤: `scrolling`, `toggleScroll()`, `speedIdx`, `speedUp()`, `speedDown()`, `speedLabel` (`'1.25×'`), `speedPx` (`'31 PX/S'`), `sheetRef`
  - 메트로놈: `metro`, `toggleMetro()`, `beat` (−1 또는 0~3), `bpm`, `bpmUp()`, `bpmDown()`, `tap()`, `muted`, `toggleMute()`
  - `SPEEDS: number[]` (export)

- [ ] **Step 1: 실패 테스트를 쓴다**

`lib/ui/__tests__/playView.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react';
import { usePlayView, SPEEDS } from '@/lib/ui/playView';

const setup = () => renderHook(() => usePlayView({ tempo: 72 }));

describe('키 시프트', () => {
  it('−11~+11에서 멈춘다', () => {
    const { result } = setup();
    act(() => { for (let i = 0; i < 15; i++) result.current.keyUp(); });
    expect(result.current.semi).toBe(11);
    act(() => { for (let i = 0; i < 30; i++) result.current.keyDown(); });
    expect(result.current.semi).toBe(-11);
  });

  it('RESET은 원키로 돌린다', () => {
    const { result } = setup();
    act(() => { result.current.keyUp(); result.current.keyReset(); });
    expect(result.current.semi).toBe(0);
  });
});

describe('글자 크기', () => {
  it('13~30px에서 멈춘다', () => {
    const { result } = setup();
    act(() => { for (let i = 0; i < 40; i++) result.current.fontUp(); });
    expect(result.current.fontSize).toBe(30);
    act(() => { for (let i = 0; i < 40; i++) result.current.fontDown(); });
    expect(result.current.fontSize).toBe(13);
  });
});

describe('오토스크롤과 단수', () => {
  it('오토스크롤을 켜면 1단으로 강제 전환한다', () => {
    const { result } = setup();
    expect(result.current.cols).toBe(2);
    act(() => result.current.toggleScroll());
    expect(result.current.scrolling).toBe(true);
    expect(result.current.cols).toBe(1);
  });

  it('2단 버튼을 누르면 스크롤이 멈춘다', () => {
    const { result } = setup();
    act(() => result.current.toggleScroll());
    act(() => result.current.setCols(2));
    expect(result.current.scrolling).toBe(false);
    expect(result.current.cols).toBe(2);
  });

  it('속도는 배속과 px/s를 함께 보여준다 — 1.0× = 25px/s', () => {
    const { result } = setup();
    act(() => { while (SPEEDS[result.current.speedIdx] !== 1) result.current.speedDown(); });
    expect(result.current.speedLabel).toBe('1×');
    expect(result.current.speedPx).toBe('25 PX/S');
  });

  it('속도는 0.5×~3.0× 8단계에서 멈춘다', () => {
    const { result } = setup();
    act(() => { for (let i = 0; i < 20; i++) result.current.speedUp(); });
    expect(SPEEDS[result.current.speedIdx]).toBe(3);
    act(() => { for (let i = 0; i < 20; i++) result.current.speedDown(); });
    expect(SPEEDS[result.current.speedIdx]).toBe(0.5);
  });
});

describe('메트로놈', () => {
  it('곡의 tempo로 시작한다', () => {
    const { result } = setup();
    expect(result.current.bpm).toBe(72);
  });

  it('40~240 BPM에서 멈춘다', () => {
    const { result } = setup();
    act(() => { for (let i = 0; i < 300; i++) result.current.bpmUp(); });
    expect(result.current.bpm).toBe(240);
    act(() => { for (let i = 0; i < 300; i++) result.current.bpmDown(); });
    expect(result.current.bpm).toBe(40);
  });

  it('TAP은 최근 간격 4개 평균으로 BPM을 잡는다', () => {
    vi.useFakeTimers();
    const { result } = setup();
    act(() => { result.current.tap(); });
    for (let i = 0; i < 4; i++) {
      act(() => { vi.advanceTimersByTime(500); result.current.tap(); });
    }
    expect(result.current.bpm).toBe(120); // 500ms 간격 = 120 BPM
    vi.useRealTimers();
  });

  it('2초 이상 벌어진 간격은 평균에서 버린다', () => {
    vi.useFakeTimers();
    const { result } = setup();
    act(() => { result.current.tap(); });
    act(() => { vi.advanceTimersByTime(5000); result.current.tap(); });
    expect(result.current.bpm).toBe(72); // 반영되지 않음
    vi.useRealTimers();
  });

  it('끄면 박자 표시가 사라진다', () => {
    const { result } = setup();
    act(() => result.current.toggleMetro());
    expect(result.current.beat).toBe(0);
    act(() => result.current.toggleMetro());
    expect(result.current.metro).toBe(false);
    expect(result.current.beat).toBe(-1);
  });
});
```

Run: `npm test -- playView`
Expected: FAIL

- [ ] **Step 2: 구현한다**

`lib/ui/playView.ts`:

```ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const BASE_PX_PER_SEC = 25; // 1.0× 기준
const DEFAULT_SPEED_IDX = 2;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function usePlayView({ tempo, initialSemi = 0 }: { tempo: number; initialSemi?: number }) {
  const [semi, setSemi] = useState(initialSemi);
  const [fontSize, setFontSize] = useState(18);
  const [cols, setColsState] = useState<1 | 2>(2);
  const [focus, setFocus] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(DEFAULT_SPEED_IDX);
  const [metro, setMetro] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [bpm, setBpmState] = useState(tempo);
  const [muted, setMuted] = useState(false);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const taps = useRef<number[]>([]);

  /* ── 오토스크롤 ── 실제 스크롤은 rAF로 굴린다.
     배속 1.0× = 25px/s. 끝에 닿으면 자동 정지. */
  useEffect(() => {
    if (!scrolling) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const el = sheetRef.current;
      if (!el) { raf = requestAnimationFrame(step); return; }
      const dt = (now - last) / 1000;
      last = now;
      el.scrollTop += SPEEDS[speedIdx] * BASE_PX_PER_SEC * dt;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        setScrolling(false);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [scrolling, speedIdx]);

  /* ── 메트로놈 ── 지금은 시각 박자만 돈다.
     ponytail: setInterval 시각 전용. 소리를 붙일 때는 Web Audio 스케줄러
     (ctx.currentTime 기준 lookahead ~100ms)로 바꾼다 — 탭이 백그라운드로 가면
     setInterval은 박자가 흔들린다. (docs/design/README.md §5-5) */
  useEffect(() => {
    if (!metro) return;
    const id = setInterval(() => {
      setBeat((b) => (b + 1) % 4);
    }, 60000 / bpm);
    return () => clearInterval(id);
  }, [metro, bpm]);

  const setCols = useCallback((n: 1 | 2) => {
    if (n === 2) setScrolling(false); // 2단은 가로로 흐르는 레이아웃 — 세로 스크롤과 맞지 않는다
    setColsState(n);
  }, []);

  const toggleScroll = useCallback(() => {
    setScrolling((on) => {
      if (!on) setColsState(1); // 켜면 1단으로 강제 전환
      return !on;
    });
  }, []);

  const setBpm = useCallback((v: number) => setBpmState(clamp(Math.round(v), 40, 240)), []);

  const tap = useCallback(() => {
    const now = Date.now();
    taps.current.push(now);
    if (taps.current.length > 5) taps.current.shift();
    const gaps: number[] = [];
    for (let i = 1; i < taps.current.length; i++) {
      const g = taps.current[i] - taps.current[i - 1];
      if (g < 2000) gaps.push(g);
    }
    if (!gaps.length) return;
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    setBpm(60000 / avg);
  }, [setBpm]);

  const toggleMetro = useCallback(() => {
    setMetro((on) => {
      setBeat(on ? -1 : 0);
      return !on;
    });
  }, []);

  const speed = SPEEDS[speedIdx];

  return {
    semi,
    keyUp: () => setSemi((s) => clamp(s + 1, -11, 11)),
    keyDown: () => setSemi((s) => clamp(s - 1, -11, 11)),
    keyReset: () => setSemi(0),

    fontSize,
    fontUp: () => setFontSize((v) => clamp(v + 1, 13, 30)),
    fontDown: () => setFontSize((v) => clamp(v - 1, 13, 30)),

    cols, setCols,
    focus, toggleFocus: () => setFocus((f) => !f),

    scrolling, toggleScroll, sheetRef,
    speedIdx,
    speedUp: () => setSpeedIdx((i) => clamp(i + 1, 0, SPEEDS.length - 1)),
    speedDown: () => setSpeedIdx((i) => clamp(i - 1, 0, SPEEDS.length - 1)),
    speedLabel: `${speed}×`,
    speedPx: `${Math.round(speed * BASE_PX_PER_SEC)} PX/S`,

    metro, toggleMetro, beat,
    bpm, setBpm,
    bpmUp: () => setBpm(bpm + 1),
    bpmDown: () => setBpm(bpm - 1),
    tap,
    muted, toggleMute: () => setMuted((m) => !m),
  };
}
```

Run: `npm test -- playView`
Expected: PASS

- [ ] **Step 3: 커밋**

```bash
git add lib/ui
git commit -m "feat: add play view state hook with autoscroll and metronome"
```

---

### Task 11: 곡 상세 좌측 레일

**Files:**
- Create: `components/song/InfoRail.tsx`
- Test: `components/song/__tests__/inforail.test.tsx`

**Interfaces:**
- Consumes: Task 2 `Song`, Task 3 `transposeChord` `keyLabel`, Task 4 프리미티브, Task 5 `Fretboard` `TuningTokens`
- Produces: `<InfoRail song: Song; semi: number />` — 352px 고정 폭, 1100px 미만에서는 상위 페이지가 숨긴다

- [ ] **Step 1: 실패 테스트를 쓴다**

`components/song/__tests__/inforail.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { InfoRail } from '@/components/song/InfoRail';
import { MOCK_SONGS } from '@/lib/mock/songs';

const song = MOCK_SONGS[0]; // 원키 G, 카포 2프렛, 표준 튜닝

describe('InfoRail', () => {
  it('원키와 현재 키를 함께 보여준다', () => {
    render(<InfoRail song={song} semi={2} />);
    expect(screen.getByText('G')).toBeInTheDocument();   // 원키
    expect(screen.getByText('A')).toBeInTheDocument();   // 현재 키 (G +2)
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('카포는 프렛 수와 설명 한 줄을 보여준다', () => {
    render(<InfoRail song={song} semi={0} />);
    expect(screen.getByText('2프렛')).toBeInTheDocument();
    expect(screen.getByText(/카포를 끼우고/)).toBeInTheDocument();
  });

  it('TEMPO와 UPDATED를 보여준다', () => {
    render(<InfoRail song={song} semi={0} />);
    expect(screen.getByText('72 BPM')).toBeInTheDocument();
    expect(screen.getByText('3일 전')).toBeInTheDocument();
  });

  it('PRACTICE NOTE와 원본 영상 링크를 하단에 둔다', () => {
    render(<InfoRail song={song} semi={0} />);
    expect(screen.getByText('PRACTICE NOTE')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /원본 영상/ })).toHaveAttribute('href', song.reference);
  });

  it('메모가 없는 곡에서는 노트 영역을 렌더링하지 않는다', () => {
    render(<InfoRail song={MOCK_SONGS[1]} semi={0} />);
    expect(screen.queryByText('PRACTICE NOTE')).toBeNull();
  });
});
```

Run: `npm test -- inforail`
Expected: FAIL

- [ ] **Step 2: 구현한다**

`components/song/InfoRail.tsx`:

```tsx
import Link from 'next/link';
import type { Song } from '@/lib/types';
import { STANDARD_TUNING } from '@/lib/types';
import { transposeChord, keyLabel } from '@/lib/chordpro/transpose';
import { MicroLabel } from '@/components/ui/MicroLabel';
import { StatusMark } from '@/components/ui/StatusMark';
import { TuningTokens } from '@/components/song/TuningTokens';
import { Fretboard } from '@/components/song/Fretboard';

export function InfoRail({ song, semi }: { song: Song; semi: number }) {
  const current = transposeChord(song.key, semi);

  return (
    <aside className="shrink-0 w-[352px] box-border p-[32px_32px_32px_48px] border-r border-line-header flex flex-col gap-5 overflow-hidden">
      <div className="flex flex-col gap-[11px]">
        <Link href="/" className="font-mono text-[11px] tracking-[0.1em] text-ink-4 no-underline">← ALL SONGS</Link>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusMark status={song.status} variant="pill" />
          {song.tags.map((t) => (
            <span key={t} className="text-[12px] text-ink-4 border border-line-chip rounded-pill px-[11px] py-[4px]">{t}</span>
          ))}
        </div>
        <h1 className="m-0 font-display text-[36px] font-bold tracking-[-0.03em] leading-[1.15]">{song.title}</h1>
        <span className="text-[15px] text-ink-3">{song.artist}</span>
      </div>

      <div className="h-px bg-line-header" />

      <div className="flex flex-col gap-[9px]">
        <MicroLabel>KEY</MicroLabel>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[19px] font-medium text-ink-5">{song.key}</span>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth={1.6}
            aria-hidden="true" className="self-center text-faint">
            <path d="M1 6h14" /><path d="m11 2 4 4-4 4" />
          </svg>
          <span className="font-mono text-[32px] font-bold leading-none text-accent">{current}</span>
          {semi !== 0 ? <span className="font-mono text-[13px] text-ink-4">{keyLabel(semi)}</span> : null}
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        <MicroLabel>TUNING</MicroLabel>
        <div className="flex items-end gap-[6px]">
          <TuningTokens tuning={song.tuning} size="rail" showStringNumbers />
          <span className="text-[12px] text-ink-5 pb-[15px] ml-[2px]">
            {song.tuning === STANDARD_TUNING ? '표준' : '비표준'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-[11px] bg-surface-2 border border-line rounded-[14px] p-[15px_17px]">
        <div className="flex items-baseline justify-between">
          <MicroLabel>CAPO</MicroLabel>
          <span className="font-mono text-[15px] font-bold text-ink">
            {song.capo > 0 ? `${song.capo}프렛` : '없음'}
          </span>
        </div>
        <Fretboard fret={song.capo} size="rail" />
        <span className="text-[12px] leading-[1.6] text-ink-4">
          {song.capo > 0
            ? `${song.capo}프렛에 카포를 끼우고 아래 코드 모양 그대로 잡으세요.`
            : '카포 없이 아래 코드 모양 그대로 잡으세요.'}
        </span>
      </div>

      <div className="flex items-center gap-[22px]">
        <div className="flex flex-col gap-[5px]">
          <MicroLabel>TEMPO</MicroLabel>
          <span className="font-mono text-[16px] font-medium text-ink-2">{song.tempo} BPM</span>
        </div>
        <div className="flex flex-col gap-[5px]">
          <MicroLabel>UPDATED</MicroLabel>
          <span className="font-mono text-[16px] font-medium text-ink-2">{song.updatedLabel}</span>
        </div>
      </div>

      {song.note ? (
        <div className="mt-auto flex flex-col gap-[10px] border-t border-line-header pt-[18px]">
          <MicroLabel>PRACTICE NOTE</MicroLabel>
          <p className="m-0 text-[13.5px] leading-[1.75] text-ink-3">{song.note}</p>
          {song.reference ? (
            <a href={song.reference} className="text-[13px] no-underline" target="_blank" rel="noreferrer">
              원본 영상 ↗
            </a>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
```

Run: `npm test -- inforail`
Expected: PASS

- [ ] **Step 3: 커밋**

```bash
git add components/song/InfoRail.tsx
git commit -m "feat: add song detail info rail"
```

---

### Task 12: 컨트롤 바 2단

**Files:**
- Create: `components/play/ControlBar.tsx`
- Test: `components/play/__tests__/controlbar.test.tsx`

**Interfaces:**
- Consumes: Task 10 `usePlayView` 반환값, Task 3 `transposeChord`, Task 4 프리미티브, Task 5 `Fretboard`, Task 6 아이콘
- Produces: `<ControlBar song: Song; view: ReturnType<typeof usePlayView> />`

구조: `--gc-surface-2` 카드 + 가운데 1px 구분선. 1단 `KEY`(키 스테퍼·RESET·카포 칩·튜닝 칩·글자 ∓·1단/2단·우측 끝 집중 모드), 2단 `PLAY`(오토스크롤 토글+속도·구분선·메트로놈 토글+박자 점 4개+BPM 스테퍼+TAP+음소거·우측 끝 안내 문구).

- [ ] **Step 1: 실패 테스트를 쓴다**

`components/play/__tests__/controlbar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react';
import { ControlBar } from '@/components/play/ControlBar';
import { usePlayView } from '@/lib/ui/playView';
import { MOCK_SONGS } from '@/lib/mock/songs';

function Harness() {
  const view = usePlayView({ tempo: MOCK_SONGS[0].tempo });
  return <ControlBar song={MOCK_SONGS[0]} view={view} />;
}

describe('ControlBar', () => {
  it('두 단의 마이크로 라벨 KEY / PLAY를 보여준다', () => {
    render(<Harness />);
    expect(screen.getByText('KEY')).toBeInTheDocument();
    expect(screen.getByText('PLAY')).toBeInTheDocument();
  });

  it('키 스테퍼가 현재 키를 바꾼다', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    expect(screen.getByText('G#')).toBeInTheDocument();
  });

  it('RESET은 원키로 되돌린다', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    await userEvent.click(screen.getByRole('button', { name: 'RESET' }));
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('오토스크롤을 켜면 안내 문구가 바뀐다', async () => {
    render(<Harness />);
    expect(screen.getByText(/오토스크롤을 켜면 1단 보기로 전환됩니다/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /오토스크롤/ }));
    expect(screen.getByText(/1단으로 바뀌고 악보가 저절로 내려갑니다/)).toBeInTheDocument();
  });

  it('박자 점 4개를 그린다', () => {
    const { container } = render(<Harness />);
    expect(container.querySelectorAll('[data-beat-dot]')).toHaveLength(4);
  });

  it('집중 모드 버튼의 라벨이 상태에 따라 바뀐다', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: /집중 모드/ }));
    expect(screen.getByRole('button', { name: /집중 모드 끄기/ })).toBeInTheDocument();
  });

  it('음소거 버튼에 aria-label이 있다', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: '메트로놈 소리 켜고 끄기' })).toBeInTheDocument();
  });
});
```

Run: `npm test -- controlbar`
Expected: FAIL

- [ ] **Step 2: 구현한다**

`components/play/ControlBar.tsx`:

```tsx
'use client';

import type { Song } from '@/lib/types';
import type { usePlayView } from '@/lib/ui/playView';
import { transposeChord } from '@/lib/chordpro/transpose';
import { MicroLabel } from '@/components/ui/MicroLabel';
import { Stepper } from '@/components/ui/Stepper';
import { Segmented } from '@/components/ui/Segmented';
import { ToolToggle } from '@/components/ui/ToolToggle';
import { Fretboard } from '@/components/song/Fretboard';
import {
  PlayIcon, PauseIcon, MetronomeIcon, SoundOnIcon, SoundOffIcon, FocusIcon,
} from '@/components/icons';

type View = ReturnType<typeof usePlayView>;

const Divider = () => <span className="w-px h-[22px] bg-line" />;

export function ControlBar({ song, view }: { song: Song; view: View }) {
  const current = transposeChord(song.key, view.semi);

  return (
    <div className="shrink-0 bg-surface-2 border border-line rounded-lg flex flex-col">
      {/* 1단 — KEY */}
      <div className="flex items-center gap-3 p-[8px_14px] flex-wrap">
        <MicroLabel className="tracking-[0.14em]">KEY</MicroLabel>

        <div className="flex items-center gap-[2px] bg-bg border border-line rounded-md p-[3px]">
          <button type="button" aria-label="키 반음 내리기" onClick={view.keyDown}
            className="w-[34px] h-[30px] flex items-center justify-center rounded-[6px] text-[17px] text-ink-2 cursor-pointer">−</button>
          <span className="min-w-[52px] text-center font-mono text-[14px] font-bold text-accent">{current}</span>
          <button type="button" aria-label="키 반음 올리기" onClick={view.keyUp}
            className="w-[34px] h-[30px] flex items-center justify-center rounded-[6px] text-[17px] text-ink-2 cursor-pointer">+</button>
        </div>

        <button type="button" onClick={view.keyReset}
          className="h-[30px] px-[10px] border border-line rounded-lg font-mono text-[11px] text-ink-4 cursor-pointer">
          RESET
        </button>

        <Divider />

        <span className="flex items-center gap-2 font-mono text-[11.5px] text-ink-4">
          <Fretboard fret={song.capo} size="bar" />
          CAPO {song.capo > 0 ? `${song.capo}프렛` : '없음'}
        </span>

        <span className="flex items-center gap-[7px] font-mono text-[11.5px] text-ink-4">
          <span className="text-[9.5px] tracking-[0.12em] text-dim">TUNING</span>{song.tuning}
        </span>

        <Divider />

        <div className="flex items-center gap-[6px]">
          <button type="button" aria-label="글자 크기 줄이기" onClick={view.fontDown}
            className="w-[32px] h-[30px] flex items-center justify-center border border-line rounded-lg text-[11px] text-ink-2 cursor-pointer">가−</button>
          <button type="button" aria-label="글자 크기 키우기" onClick={view.fontUp}
            className="w-[32px] h-[30px] flex items-center justify-center border border-line rounded-lg text-[14px] text-ink-2 cursor-pointer">가+</button>
        </div>

        <Segmented
          value={String(view.cols)}
          onChange={(v) => view.setCols(v === '1' ? 1 : 2)}
          options={[{ value: '1', label: '1단' }, { value: '2', label: '2단' }]}
        />

        <button type="button" onClick={view.toggleFocus}
          className="ml-auto h-[32px] px-[14px] flex items-center gap-2 border border-line rounded-lg text-[13px] font-medium text-ink-2 cursor-pointer">
          <FocusIcon />{view.focus ? '집중 모드 끄기' : '집중 모드'}
        </button>
      </div>

      <div className="h-px bg-line-soft" />

      {/* 2단 — PLAY */}
      <div className="flex items-center gap-3 p-[8px_14px] flex-wrap">
        <MicroLabel className="tracking-[0.14em]">PLAY</MicroLabel>

        <ToolToggle
          active={view.scrolling}
          onClick={view.toggleScroll}
          icon={view.scrolling ? <PauseIcon /> : <PlayIcon />}
          label={view.scrolling ? '멈춤' : '오토스크롤'}
        />
        <Stepper
          value={view.speedLabel} sub={view.speedPx}
          onDec={view.speedDown} onInc={view.speedUp}
          decLabel="스크롤 속도 낮추기" incLabel="스크롤 속도 높이기"
        />

        <Divider />

        <ToolToggle
          active={view.metro}
          onClick={view.toggleMetro}
          icon={<MetronomeIcon />}
          label={view.metro ? '박자 끄기' : '메트로놈'}
        />

        <span className="flex items-center gap-[6px]">
          {[0, 1, 2, 3].map((i) => {
            const live = view.metro && view.beat === i;
            const size = i === 0 ? 9 : 7;
            return (
              <span
                key={i}
                data-beat-dot
                style={{ width: size, height: size, boxShadow: live ? '0 0 0 4px rgba(255,157,77,0.16)' : undefined }}
                className={`rounded-full ${live ? 'bg-accent' : 'bg-line-strong'}`}
              />
            );
          })}
        </span>

        <Stepper
          value={String(view.bpm)} sub="BPM"
          onDec={view.bpmDown} onInc={view.bpmUp}
          decLabel="BPM 낮추기" incLabel="BPM 높이기"
        />

        <button type="button" onClick={view.tap}
          className="h-[32px] px-3 border border-line rounded-lg font-mono text-[11px] tracking-[0.1em] text-ink-4 cursor-pointer">
          TAP
        </button>

        <button type="button" aria-label="메트로놈 소리 켜고 끄기" aria-pressed={view.muted} onClick={view.toggleMute}
          className={`w-[32px] h-[32px] flex items-center justify-center border border-line rounded-lg cursor-pointer ${
            view.muted ? 'text-dim' : 'text-ink-2'
          }`}>
          {view.muted ? <SoundOffIcon /> : <SoundOnIcon />}
        </button>

        <span className="ml-auto text-[11.5px] text-faint">
          {view.scrolling
            ? '1단으로 바뀌고 악보가 저절로 내려갑니다 — 아무 버튼이나 누르면 멈춰요'
            : '오토스크롤을 켜면 1단 보기로 전환됩니다'}
        </span>
      </div>
    </div>
  );
}
```

Run: `npm test -- controlbar`
Expected: PASS

- [ ] **Step 3: 커밋**

```bash
git add components/play/ControlBar.tsx
git commit -m "feat: add two-row play control bar"
```

---

### Task 13: 곡 상세 · 연주 뷰 `/songs/[slug]` 조립

**Files:**
- Create: `components/play/SongDetailView.tsx` (클라이언트 컴포넌트 — 상태를 들고 있다)
- Create: `app/songs/[slug]/page.tsx` (서버 컴포넌트 — 목 데이터 조회 + `?key` 읽기)
- Test: `components/play/__tests__/songdetail.test.tsx`

**Interfaces:**
- Consumes: Task 8 `Sheet` `sheetBlocks` `strumBlocks`, Task 9 `StrumGrid` `patternName`, Task 10 `usePlayView`, Task 11 `InfoRail`, Task 12 `ControlBar`
- Produces: `<SongDetailView song: Song; initialSemi: number />`

- [ ] **Step 1: 실패 테스트를 쓴다**

`components/play/__tests__/songdetail.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SongDetailView } from '@/components/play/SongDetailView';
import { MOCK_SONGS } from '@/lib/mock/songs';

const song = MOCK_SONGS[0];

describe('SongDetailView', () => {
  it('URL에서 받은 키 시프트로 시작한다', () => {
    render(<SongDetailView song={song} initialSemi={2} />);
    expect(screen.getAllByText('A').length).toBeGreaterThan(0); // G +2
  });

  it('집중 모드를 켜면 좌측 레일이 사라지고 컨트롤 바는 남는다', async () => {
    render(<SongDetailView song={song} initialSemi={0} />);
    expect(screen.getByText('PRACTICE NOTE')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /집중 모드/ }));
    expect(screen.queryByText('PRACTICE NOTE')).toBeNull();
    expect(screen.getByText('PLAY')).toBeInTheDocument(); // 컨트롤 바는 유지
  });

  it('스트러밍 패턴을 시트 밖에 A·B로 보여준다', () => {
    render(<SongDetailView song={song} initialSemi={0} />);
    expect(screen.getByText('PATTERN A')).toBeInTheDocument();
    expect(screen.getByText('PATTERN B')).toBeInTheDocument();
  });

  it('키를 바꾸면 악보 코드도 함께 이조된다', async () => {
    render(<SongDetailView song={song} initialSemi={0} />);
    expect(screen.getAllByText('Am7').length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    expect(screen.getAllByText('A#m7').length).toBeGreaterThan(0);
  });

  it('TAB은 키를 바꿔도 그대로다', async () => {
    render(<SongDetailView song={song} initialSemi={0} />);
    const before = screen.getAllByText(/13-11/)[0].textContent;
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    expect(screen.getAllByText(/13-11/)[0].textContent).toBe(before);
  });

  it('URL 힌트 줄에 현재 키 상태를 보여준다', async () => {
    render(<SongDetailView song={song} initialSemi={0} />);
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    expect(screen.getByText(new RegExp(`/songs/${song.slug}\\?key=\\+1`))).toBeInTheDocument();
  });
});
```

Run: `npm test -- songdetail`
Expected: FAIL

- [ ] **Step 2: SongDetailView를 구현한다**

키 상태는 `?key=+2`로 URL에 남긴다 — 새로고침·링크 공유에서 유지되어야 한다. 오토스크롤·메트로놈은 저장하지 않는다.

`components/play/SongDetailView.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { Song } from '@/lib/types';
import { usePlayView } from '@/lib/ui/playView';
import { keyLabel } from '@/lib/chordpro/transpose';
import { Sheet, strumBlocks } from '@/components/sheet/Sheet';
import { StrumGrid, patternName } from '@/components/sheet/StrumGrid';
import { InfoRail } from '@/components/song/InfoRail';
import { ControlBar } from '@/components/play/ControlBar';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { IS_ADMIN } from '@/lib/mock/flags';

export function SongDetailView({ song, initialSemi }: { song: Song; initialSemi: number }) {
  const view = usePlayView({ tempo: song.tempo, initialSemi });
  const patterns = strumBlocks(song.blocks);

  // 키 상태만 주소에 남긴다. 오토스크롤·메트로놈은 공유할 값이 아니다.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (view.semi === 0) url.searchParams.delete('key');
    else url.searchParams.set('key', keyLabel(view.semi));
    window.history.replaceState(null, '', url);
  }, [view.semi]);

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      {!view.focus ? (
        <SiteHeader
          variant="detail"
          crumb={song.title}
          actions={
            IS_ADMIN ? (
              <Link href={`/songs/${song.slug}/edit`}
                className="h-[34px] flex items-center px-[14px] border border-line rounded-lg bg-surface-2 text-ink-2 text-[13px] font-medium no-underline">
                편집
              </Link>
            ) : null
          }
        />
      ) : null}

      <div className="grow flex overflow-hidden">
        {!view.focus ? (
          <div className="hidden min-[1100px]:flex">
            <InfoRail song={song} semi={view.semi} />
          </div>
        ) : null}

        <main className="grow box-border p-[24px_48px_30px_32px] flex flex-col gap-[14px] overflow-hidden">
          <ControlBar song={song} view={view} />

          {patterns.length ? (
            <section className="shrink-0 flex gap-[18px] flex-wrap">
              {patterns.map((p, i) => (
                <StrumGrid key={i} name={patternName(i)} use={p.use} slots={p.slots} />
              ))}
            </section>
          ) : null}

          <Sheet
            containerRef={view.sheetRef}
            blocks={song.blocks}
            semi={view.semi}
            fontSize={view.fontSize}
            cols={view.cols}
          />

          <div className="shrink-0 flex items-center gap-[10px] flex-wrap">
            <span className="font-mono text-[11px] text-faint">
              /songs/{song.slug}{view.semi !== 0 ? `?key=${keyLabel(view.semi)}` : ''}
            </span>
            <span className="text-[11.5px] text-faint">
              — 키 상태는 주소에 남습니다. 오토스크롤·메트로놈은 저장되지 않는 화면 상태예요.
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
```

주의: 오토스크롤이 굴리는 요소는 `Sheet`의 루트 div다(자체 `overflow-y-auto`를 갖고 있다). 그래서 `view.sheetRef`를 래퍼가 아니라 `Sheet`의 `containerRef`에 넘긴다 — Task 8에서 이미 그 prop을 받도록 만들어 뒀다.

- [ ] **Step 3: 페이지를 만든다**

`app/songs/[slug]/page.tsx` — 서버 컴포넌트. `?key=+2`를 읽어 초기 시프트로 넘긴다.

```tsx
import { notFound } from 'next/navigation';
import { getSong } from '@/lib/mock/songs';
import { SongDetailView } from '@/components/play/SongDetailView';

function parseSemi(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  if (!v || Number.isNaN(n)) return 0;
  return Math.max(-11, Math.min(11, Math.trunc(n)));
}

export default async function SongPage({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string | string[] }>;
}) {
  const { slug } = await params;
  const { key } = await searchParams;
  const song = getSong(decodeURIComponent(slug));
  if (!song) notFound();

  return <SongDetailView song={song} initialSemi={parseSemi(key)} />;
}
```

Run: `npm test -- songdetail` · `npm run dev` 후 `/songs/saebyeok-du-siui-golmok?key=%2B2` 육안 확인
Expected: 테스트 PASS, 키가 A로 시작, 집중 모드·오토스크롤 동작

- [ ] **Step 4: 커밋**

```bash
git add components/play app/songs
git commit -m "feat: add song detail play view with focus mode and key url state"
```

---

### Task 14: 모바일 연주 뷰와 하단 독

**Files:**
- Create: `components/play/MobileDock.tsx`
- Create: `components/play/MobilePlayView.tsx`
- Modify: `components/play/SongDetailView.tsx` (모바일 폭에서 MobilePlayView로 갈라짐)
- Test: `components/play/__tests__/mobiledock.test.tsx`

**Interfaces:**
- Consumes: Task 10 `usePlayView`, Task 9 `StrumGrid`, Task 8 `Sheet`
- Produces:
  - `<MobileDock song: Song; view: View />` — 2단 플로팅 독
  - `<MobilePlayView song: Song; view: View />` — 모바일 상단 + 시트 + 독

**핵심:** 메트로놈 버튼은 켜져 있을 때 **현재 박자 숫자(1·2·3·4)** 를 표시하고 첫 박에 앰버로 꽉 찬다. 좁은 화면에 박자 점을 따로 놓을 자리가 없어 버튼이 표시기를 겸한다.

- [ ] **Step 1: 실패 테스트를 쓴다**

`components/play/__tests__/mobiledock.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileDock } from '@/components/play/MobileDock';
import { usePlayView } from '@/lib/ui/playView';
import { MOCK_SONGS } from '@/lib/mock/songs';

function Harness() {
  const view = usePlayView({ tempo: MOCK_SONGS[0].tempo });
  return <MobileDock song={MOCK_SONGS[0]} view={view} />;
}

describe('MobileDock', () => {
  it('모든 독 버튼이 44px 이상 높이를 유지한다', () => {
    render(<Harness />);
    for (const name of ['오토스크롤 켜고 끄기', '메트로놈 켜고 끄기', '키 반음 내리기', '키 반음 올리기', '글자 작게', '글자 크게']) {
      const btn = screen.getByRole('button', { name });
      expect(btn.className).toMatch(/h-\[4[4-9]px\]|h-11/);
    }
  });

  it('메트로놈이 켜지면 버튼이 박자 숫자를 보여준다', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: '메트로놈 켜고 끄기' }));
    expect(screen.getByRole('button', { name: '메트로놈 켜고 끄기' }).textContent).toBe('1');
  });

  it('현재 키와 시프트를 함께 보여준다', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    expect(screen.getByText('G#')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
```

Run: `npm test -- mobiledock`
Expected: FAIL

- [ ] **Step 2: MobileDock을 구현한다**

`components/play/MobileDock.tsx`:

```tsx
'use client';

import type { Song } from '@/lib/types';
import type { usePlayView } from '@/lib/ui/playView';
import { transposeChord, keyLabel } from '@/lib/chordpro/transpose';
import { Stepper } from '@/components/ui/Stepper';
import { PlayIcon, PauseIcon, MetronomeIcon } from '@/components/icons';

type View = ReturnType<typeof usePlayView>;

export function MobileDock({ song, view }: { song: Song; view: View }) {
  const current = transposeChord(song.key, view.semi);
  const dockBtn = 'w-[46px] h-[44px] flex items-center justify-center border-0 rounded-xl cursor-pointer';

  return (
    <div className="fixed left-[14px] right-[14px] bottom-6 flex flex-col gap-[6px] bg-surface-3 border border-line-strong rounded-dock p-2 shadow-dock">
      {/* 위 — 오토스크롤 · 속도 · 메트로놈 · BPM */}
      <div className="flex items-center gap-[5px]">
        <button
          type="button"
          aria-label="오토스크롤 켜고 끄기"
          aria-pressed={view.scrolling}
          onClick={view.toggleScroll}
          className={`${dockBtn} ${view.scrolling ? 'bg-accent text-accent-ink' : 'bg-control text-ink-2'}`}
        >
          {view.scrolling ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
        </button>
        <Stepper
          size="dock" value={view.speedLabel} sub="SCROLL"
          onDec={view.speedDown} onInc={view.speedUp}
          decLabel="스크롤 속도 낮추기" incLabel="스크롤 속도 높이기"
        />

        <span className="w-px h-[26px] bg-line-strong mx-px" />

        <button
          type="button"
          aria-label="메트로놈 켜고 끄기"
          aria-pressed={view.metro}
          onClick={view.toggleMetro}
          className={`${dockBtn} font-mono text-[17px] font-bold ${
            view.metro && view.beat === 0
              ? 'bg-accent text-accent-ink'
              : view.metro
                ? 'bg-control text-accent'
                : 'bg-control text-ink-2'
          }`}
        >
          {view.metro ? String(view.beat + 1) : <MetronomeIcon size={16} />}
        </button>
        <Stepper
          size="dock" value={String(view.bpm)} sub="BPM"
          onDec={view.bpmDown} onInc={view.bpmUp}
          decLabel="BPM 낮추기" incLabel="BPM 높이기"
        />
      </div>

      {/* 아래 — 키 · 글자 크기 */}
      <div className="flex items-center gap-[6px]">
        <button type="button" aria-label="키 반음 내리기" onClick={view.keyDown}
          className={`${dockBtn} bg-control text-ink text-[20px]`}>−</button>
        <span className="grow flex flex-col items-center gap-px">
          <span className="font-mono text-[9.5px] tracking-[0.16em] text-ink-5">KEY</span>
          <span className="font-mono text-[19px] font-bold leading-[1.1] text-accent">
            {current}{' '}
            {view.semi !== 0 ? <span className="text-[11px] text-ink-4">{keyLabel(view.semi)}</span> : null}
          </span>
        </span>
        <button type="button" aria-label="키 반음 올리기" onClick={view.keyUp}
          className={`${dockBtn} bg-control text-ink text-[20px]`}>+</button>

        <span className="w-px h-[26px] bg-line-strong mx-[2px]" />

        <button type="button" aria-label="글자 작게" onClick={view.fontDown}
          className={`${dockBtn} bg-control text-ink-2 text-[12px]`}>가−</button>
        <button type="button" aria-label="글자 크게" onClick={view.fontUp}
          className={`${dockBtn} bg-control text-ink-2 text-[16px]`}>가+</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: MobilePlayView를 구현하고 SongDetailView에서 갈라 준다**

`components/play/MobilePlayView.tsx` — 상단 52px는 실제 상태바 자리로 비워 둔다. 패턴은 A/B 토글로 하나씩 보여준다.

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Song } from '@/lib/types';
import type { usePlayView } from '@/lib/ui/playView';
import { Sheet, strumBlocks } from '@/components/sheet/Sheet';
import { StrumGrid, patternName } from '@/components/sheet/StrumGrid';
import { MobileDock } from '@/components/play/MobileDock';
import { Fretboard } from '@/components/song/Fretboard';
import { ChevronLeftIcon, SoundOnIcon, SoundOffIcon } from '@/components/icons';

type View = ReturnType<typeof usePlayView>;

export function MobilePlayView({ song, view }: { song: Song; view: View }) {
  const patterns = strumBlocks(song.blocks);
  const [patternIdx, setPatternIdx] = useState(0);
  const pattern = patterns[patternIdx];

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header className="shrink-0 pt-[52px] px-3 pb-[10px] flex flex-col gap-2 border-b border-line-hair">
        <div className="flex items-center gap-1">
          <Link href="/" aria-label="목록으로" className="w-11 h-11 flex items-center justify-center no-underline text-ink-3">
            <ChevronLeftIcon />
          </Link>
          <span className="flex flex-col gap-[2px] grow min-w-0">
            <span className="font-display text-[17px] font-semibold tracking-[-0.015em] truncate">{song.title}</span>
            <span className="font-mono text-[10.5px] tracking-[0.06em] text-ink-5">{song.artist} · 원키 {song.key}</span>
          </span>
          <button type="button" aria-label="메트로놈 소리 켜고 끄기" aria-pressed={view.muted} onClick={view.toggleMute}
            className={`w-11 h-11 flex items-center justify-center border-0 bg-transparent cursor-pointer ${view.muted ? 'text-dim' : 'text-ink-2'}`}>
            {view.muted ? <SoundOffIcon size={18} /> : <SoundOnIcon size={18} />}
          </button>
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="flex items-center gap-[7px] border border-line-chip rounded-md px-[9px] py-[5px]">
            <Fretboard fret={song.capo} size="row" />
            <span className="font-mono text-[11px] font-bold text-ink-2">{song.capo}F</span>
          </span>
          <span className="flex items-center gap-[7px] border border-line-chip rounded-md px-[10px] py-[7px]">
            <span className="font-mono text-[9px] tracking-[0.12em] text-dim">TUNING</span>
            <span className="font-mono text-[11px] font-medium text-ink-2">{song.tuning}</span>
          </span>
        </div>
      </header>

      <div className="grow flex flex-col gap-4 px-3 pt-3 pb-[150px] overflow-hidden">
        {pattern ? (
          <div className="flex flex-col gap-2">
            {patterns.length > 1 ? (
              <div className="flex justify-end">
                <span className="flex items-center border border-line-strong rounded-sm overflow-hidden">
                  {patterns.map((_, i) => (
                    <button key={i} type="button" onClick={() => setPatternIdx(i)}
                      aria-pressed={i === patternIdx}
                      className={`w-11 h-[30px] text-[12px] font-bold cursor-pointer ${
                        i === patternIdx ? 'bg-accent text-accent-ink' : 'bg-transparent text-ink-4'
                      }`}>
                      {String.fromCharCode(65 + i)}
                    </button>
                  ))}
                </span>
              </div>
            ) : null}
            <StrumGrid name={patternName(patternIdx)} use={pattern.use} slots={pattern.slots} size="mobile" />
            <span className="text-[10.5px] text-faint">↓ 다운 · ↑ 업 · 주황은 강세</span>
          </div>
        ) : null}

        <Sheet
          containerRef={view.sheetRef}
          blocks={song.blocks}
          semi={view.semi}
          fontSize={view.fontSize}
          cols={1}
        />
      </div>

      <MobileDock song={song} view={view} />
    </div>
  );
}
```

`components/play/SongDetailView.tsx`를 고쳐 폭에 따라 갈라 준다 — 훅은 상위에서 한 번만 부르고 두 뷰에 같은 `view`를 넘긴다.

```tsx
// SongDetailView 내부: 기존 반환을 아래처럼 감싼다
return (
  <>
    <div className="hidden md:contents">{/* 기존 데스크톱 마크업 */}</div>
    <div className="md:hidden">
      <MobilePlayView song={song} view={view} />
    </div>
  </>
);
```

주의: 모바일은 항상 1단이다(`cols={1}` 고정). `view.cols`는 데스크톱 전용이다.

Run: `npm test -- mobiledock` · 390px 폭에서 육안 확인
Expected: 테스트 PASS, 독이 하단에 뜨고 모든 버튼이 44px 이상

- [ ] **Step 4: 커밋**

```bash
git add components/play
git commit -m "feat: add mobile play view with floating dock"
```

---

### Task 15: 에디터 메타 영역 — 12컬럼 그리드

**Files:**
- Create: `components/editor/MetaForm.tsx`
- Test: `components/editor/__tests__/metaform.test.tsx`

**Interfaces:**
- Consumes: Task 4 `UnderlineField` `MicroLabel`, Task 5 `Fretboard` `TuningTokens`
- Produces: `<MetaForm song?: Song />` — 상태 없는 비제어 폼(값은 `defaultValue`). 저장은 추후 적용.

레이아웃: 12컬럼 그리드, gap `20px 24px`.
1행 `TITLE 4 · ARTIST 2 · KEY 1 · TEMPO 1 · STATUS 2 · REFERENCE 2`,
2행 `TUNING 3 · CAPO 5 · TAGS 4`. TUNING·CAPO·TAGS만 박스 카드(`surface-2` + `rounded-lg`), 나머지는 밑줄 입력.

- [ ] **Step 1: 실패 테스트를 쓴다**

`components/editor/__tests__/metaform.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MetaForm } from '@/components/editor/MetaForm';
import { MOCK_SONGS } from '@/lib/mock/songs';

describe('MetaForm', () => {
  it('모든 입력에 label이 연결되어 있다', () => {
    render(<MetaForm song={MOCK_SONGS[0]} />);
    for (const label of ['TITLE *', 'ARTIST', 'KEY', 'TEMPO', 'STATUS', 'REFERENCE', 'TUNING', 'TAGS']) {
      expect(screen.getByLabelText(new RegExp(label.replace(' *', '')))).toBeInTheDocument();
    }
  });

  it('제목 입력은 Hahmlet을 쓴다', () => {
    render(<MetaForm song={MOCK_SONGS[0]} />);
    expect(screen.getByLabelText(/TITLE/).className).toContain('font-display');
  });

  it('TEMPO 입력은 mono를 쓴다', () => {
    render(<MetaForm song={MOCK_SONGS[0]} />);
    expect(screen.getByLabelText(/TEMPO/).className).toContain('font-mono');
  });

  it('카포 카드는 코드가 바뀌지 않는다는 설명을 단다', () => {
    render(<MetaForm song={MOCK_SONGS[0]} />);
    expect(screen.getByText(/악보 코드는 바뀌지 않아요/)).toBeInTheDocument();
  });

  it('새 곡일 때는 빈 폼을 보여준다', () => {
    render(<MetaForm />);
    expect((screen.getByLabelText(/TITLE/) as HTMLInputElement).value).toBe('');
  });
});
```

Run: `npm test -- metaform`
Expected: FAIL

- [ ] **Step 2: 구현한다**

`components/editor/MetaForm.tsx`:

```tsx
'use client';

import { useState } from 'react';
import type { Song } from '@/lib/types';
import { MicroLabel } from '@/components/ui/MicroLabel';
import { UnderlineField } from '@/components/ui/UnderlineField';
import { Fretboard } from '@/components/song/Fretboard';
import { TuningTokens } from '@/components/song/TuningTokens';

const UNDERLINE = 'h-[34px] w-full p-0 border-0 border-b border-line-strong bg-transparent text-ink outline-none';
const TUNING_PRESETS: Record<string, string> = {
  '표준': 'E A D G B E',
  'Drop D': 'D A D G B E',
  '반음 내림': 'Eb Ab Db Gb Bb Eb',
  '오픈 G': 'D G D G B D',
};

export function MetaForm({ song }: { song?: Song }) {
  const [tuning, setTuning] = useState(song?.tuning ?? TUNING_PRESETS['표준']);
  const [capo, setCapo] = useState(song?.capo ?? 0);
  const [tags, setTags] = useState<string[]>(song?.tags ?? []);

  return (
    <section className="shrink-0 box-border p-[22px_48px_20px] border-b border-line-header grid grid-cols-12 gap-x-6 gap-y-5">
      <UnderlineField label="TITLE *" htmlFor="title" span={4}>
        <input id="title" type="text" defaultValue={song?.title ?? ''}
          className={`${UNDERLINE} font-display text-[20px] font-semibold`} />
      </UnderlineField>

      <UnderlineField label="ARTIST" htmlFor="artist" span={2}>
        <input id="artist" type="text" defaultValue={song?.artist ?? ''} className={`${UNDERLINE} text-[16px]`} />
      </UnderlineField>

      <UnderlineField label="KEY" htmlFor="key" span={1}>
        <select id="key" defaultValue={song?.key ?? 'G'} className={`${UNDERLINE} font-mono text-[16px] font-medium`}>
          {['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Am', 'Em', 'Dm'].map((k) => <option key={k}>{k}</option>)}
        </select>
      </UnderlineField>

      <UnderlineField label="TEMPO" htmlFor="tempo" span={1}>
        <input id="tempo" type="number" min={40} max={240} defaultValue={song?.tempo ?? 90}
          className={`${UNDERLINE} font-mono text-[16px]`} />
      </UnderlineField>

      <UnderlineField label="STATUS" htmlFor="status" span={2}>
        <select id="status" defaultValue={song?.status ?? 'practicing'} className={`${UNDERLINE} text-[15px]`}>
          <option value="practicing">연습중</option>
          <option value="done">완성</option>
          <option value="archived">보관</option>
        </select>
      </UnderlineField>

      <UnderlineField label="REFERENCE" htmlFor="ref" span={2}>
        <input id="ref" type="url" placeholder="원본 영상 주소" defaultValue={song?.reference ?? ''}
          className={`${UNDERLINE} text-[14px]`} />
      </UnderlineField>

      {/* 박스 카드 3종 */}
      <div className="col-span-3 flex flex-col gap-[9px]">
        <MicroLabel as="label" htmlFor="tuning">TUNING</MicroLabel>
        <div className="flex items-center gap-3 bg-surface-2 border border-line rounded-lg p-[11px_14px]">
          <select id="tuning" value={Object.keys(TUNING_PRESETS).find((k) => TUNING_PRESETS[k] === tuning) ?? '직접 입력'}
            onChange={(e) => setTuning(TUNING_PRESETS[e.target.value] ?? tuning)}
            className="h-[38px] px-2 border border-line-strong rounded-lg bg-bg text-[13.5px] text-ink outline-none">
            {[...Object.keys(TUNING_PRESETS), '직접 입력'].map((k) => <option key={k}>{k}</option>)}
          </select>
          <TuningTokens tuning={tuning} size="editor" />
        </div>
      </div>

      <div className="col-span-5 flex flex-col gap-[9px]">
        <MicroLabel as="label" htmlFor="capo">CAPO — 끼우는 위치만 기록합니다</MicroLabel>
        <div className="flex items-center gap-4 bg-surface-2 border border-line rounded-lg p-[11px_14px]">
          <select id="capo" value={capo} onChange={(e) => setCapo(Number(e.target.value))}
            className="h-[38px] px-[10px] border border-line-strong rounded-lg bg-bg font-mono text-[15px] font-bold text-ink outline-none">
            {Array.from({ length: 8 }, (_, i) => <option key={i} value={i}>{i}프렛</option>)}
          </select>
          <Fretboard fret={capo} size="editor" />
          <span className="text-[12.5px] leading-[1.6] text-ink-4">
            악보 코드는 바뀌지 않아요.<br />연주할 때 참고용으로만 보입니다.
          </span>
        </div>
      </div>

      <div className="col-span-4 flex flex-col gap-[9px]">
        <MicroLabel as="label" htmlFor="tags">TAGS</MicroLabel>
        <div className="flex items-center gap-2 flex-wrap min-h-[62px] box-border p-[4px_12px] border border-line rounded-lg bg-surface-2">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-[7px] text-[13px] text-accent border border-accent/35 bg-accent/10 px-[10px] py-1 rounded-sm">
              {t}
              <button type="button" aria-label={`${t} 태그 제거`} onClick={() => setTags(tags.filter((x) => x !== t))}
                className="border-0 bg-transparent text-accent text-[13px] leading-none cursor-pointer p-0">×</button>
            </span>
          ))}
          <input id="tags" type="text" placeholder="입력 후 Enter"
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              const v = e.currentTarget.value.trim();
              if (v && !tags.includes(v)) setTags([...tags, v]);
              e.currentTarget.value = '';
            }}
            className="grow h-[28px] border-0 bg-transparent text-[13px] text-ink outline-none" />
        </div>
      </div>
    </section>
  );
}
```

Run: `npm test -- metaform`
Expected: PASS

- [ ] **Step 3: 커밋**

```bash
git add components/editor/MetaForm.tsx
git commit -m "feat: add song editor meta form"
```

---

### Task 16: 에디터 소스·미리보기 2분할과 삽입 툴바

**Files:**
- Create: `components/editor/InsertToolbar.tsx`
- Create: `components/editor/SourcePane.tsx`
- Create: `components/editor/PreviewPane.tsx`
- Create: `components/editor/SongEditor.tsx`
- Create: `lib/mock/editorSample.ts`
- Create: `app/songs/new/page.tsx`
- Test: `components/editor/__tests__/editor.test.tsx`

**Interfaces:**
- Consumes: Task 8 `Sheet`, Task 9 `StrumGrid`, Task 15 `MetaForm`
- Produces:
  - `SNIPPETS` — 삽입 툴바가 넣는 뼈대 문자열 5종
  - `<InsertToolbar onInsert: (snippet: string) => void />`
  - `<SourcePane value: string; onChange: (v: string) => void; toolbar?: ReactNode; errorLine?: number; errorMessage?: string; textareaRef />` — `toolbar`는 `SOURCE · CHORDPRO` 헤더 **바로 아래**에 들어간다(아트보드 배치)
  - `<PreviewPane song: Song; source: string />` — 이번 범위에서는 고정 픽스처를 렌더링한다
  - `<SongEditor song?: Song />`
  - `SAMPLE_SOURCE`, `SAMPLE_ERROR` (목 파싱 오류 — 24행 닫히지 않은 대괄호)

**범위 주의:** 실제 파싱은 없다. 미리보기는 `lib/mock/`의 블록을 그대로 그리고, 오류 스트립도 고정값이다. 파서가 붙으면 `PreviewPane`이 `parse(source)` 결과를 받도록 한 줄만 바꾸면 된다.

- [ ] **Step 1: 실패 테스트를 쓴다**

`components/editor/__tests__/editor.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InsertToolbar, SNIPPETS } from '@/components/editor/InsertToolbar';
import { SourcePane } from '@/components/editor/SourcePane';

describe('SNIPPETS', () => {
  it('TAB 버튼은 6줄 뼈대를 넣는다 — 손으로 치게 두지 않는다', () => {
    expect(SNIPPETS.tab.split('\n').filter((l) => l.includes('|')).length).toBe(6);
  });

  it('스트러밍 뼈대는 16칸 + 강세 줄 구조다', () => {
    const lines = SNIPPETS.strum.split('\n');
    const slotLine = lines.find((l) => l.trim().startsWith('D'))!;
    expect(slotLine.trim().split(/\s+/)).toHaveLength(16);
  });
});

describe('InsertToolbar', () => {
  it('버튼 5개를 보여주고 눌리면 해당 뼈대를 넘긴다', async () => {
    const onInsert = vi.fn();
    render(<InsertToolbar onInsert={onInsert} />);
    await userEvent.click(screen.getByRole('button', { name: 'TAB 6줄' }));
    expect(onInsert).toHaveBeenCalledWith(SNIPPETS.tab);
  });
});

describe('SourcePane', () => {
  it('textarea에 label이 연결되어 있다', () => {
    render(<SourcePane value="" onChange={() => {}} />);
    expect(screen.getByLabelText('악보 원문')).toBeInTheDocument();
  });

  it('줄번호 거터는 장식이므로 aria-hidden이다', () => {
    const { container } = render(<SourcePane value={'a\nb\nc'} onChange={() => {}} />);
    expect(container.querySelector('[data-gutter]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('오류 줄번호를 danger 색으로 표시하고 하단 스트립을 띄운다', () => {
    render(
      <SourcePane value={'a\nb\nc'} onChange={() => {}} errorLine={2} errorMessage="닫히지 않은 대괄호 [Am7" />
    );
    expect(screen.getByText('2행')).toBeInTheDocument();
    expect(screen.getByText(/닫히지 않은 대괄호/)).toBeInTheDocument();
  });

  it('오류가 없으면 스트립을 렌더링하지 않는다', () => {
    const { container } = render(<SourcePane value="a" onChange={() => {}} />);
    expect(container.querySelector('[data-error-strip]')).toBeNull();
  });
});
```

Run: `npm test -- editor`
Expected: FAIL

- [ ] **Step 2: InsertToolbar를 구현한다**

`components/editor/InsertToolbar.tsx`. 입력은 `D`/`U`/`>`로 받고 화살표는 표시에서만 쓴다 — 사용자가 화살표를 직접 타이핑하게 만들지 않는다.

```tsx
'use client';

export const SNIPPETS = {
  chord: '[]',
  section: '{soc: 구간 이름}\n\n{eoc}\n',
  strum: '{sos: 쓰는 구간}\nD - D - D U D - D - D - D U - -\n>               >\n{eos}\n',
  tab: '{sot: 제목  x1}\nE|---------------------------|\nB|---------------------------|\nG|---------------------------|\nD|---------------------------|\nA|---------------------------|\nE|---------------------------|\n{eot}\n',
  comment: '{comment: }\n',
} as const;

const BUTTONS: { key: keyof typeof SNIPPETS; label: string; accent?: boolean }[] = [
  { key: 'chord', label: '[코드]' },
  { key: 'section', label: '섹션' },
  { key: 'strum', label: '스트러밍', accent: true },
  { key: 'tab', label: 'TAB 6줄', accent: true },
  { key: 'comment', label: '메모' },
];

export function InsertToolbar({ onInsert }: { onInsert: (snippet: string) => void }) {
  return (
    <div className="shrink-0 flex items-center gap-[7px] p-[9px_20px] border-b border-line-hair overflow-x-auto">
      <span className="font-mono text-[9.5px] tracking-[0.14em] text-hairline mr-[3px]">INSERT</span>
      {BUTTONS.map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={() => onInsert(SNIPPETS[b.key])}
          className={`shrink-0 h-[28px] px-[10px] border rounded-sm font-mono text-[11.5px] cursor-pointer ${
            b.accent ? 'border-accent/40 bg-accent/10 text-accent' : 'border-line bg-transparent text-ink-2'
          }`}
        >
          {b.label}
        </button>
      ))}
      <span className="ml-auto text-[11px] text-hairline whitespace-nowrap">D 다운 · U 업 · &gt; 강세</span>
    </div>
  );
}
```

- [ ] **Step 3: SourcePane과 PreviewPane을 구현한다**

`components/editor/SourcePane.tsx` — 줄번호 거터 48px, mono 12.5/24. 파싱 오류는 막지 않고 알려만 준다.

```tsx
'use client';

import type { ReactNode, Ref } from 'react';

export function SourcePane({
  value, onChange, toolbar, errorLine, errorMessage, textareaRef,
}: {
  value: string; onChange: (v: string) => void;
  toolbar?: ReactNode;
  errorLine?: number; errorMessage?: string;
  textareaRef?: Ref<HTMLTextAreaElement>;
}) {
  const lines = value.split('\n').length;

  return (
    <section className="flex flex-col bg-sunk md:border-r border-line-header overflow-hidden">
      <div className="shrink-0 h-10 px-5 flex items-center gap-3 border-b border-line-hair">
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-dim">SOURCE · CHORDPRO</span>
      </div>

      {toolbar}

      <div className="grow flex overflow-hidden">
        <div data-gutter aria-hidden="true"
          className="shrink-0 w-12 box-border pt-4 pr-3 pb-4 text-right font-mono text-[12.5px] leading-6 text-hairline flex flex-col">
          {Array.from({ length: lines }, (_, i) => {
            const n = i + 1;
            return <span key={n} className={n === errorLine ? 'text-danger font-bold' : ''}>{n}</span>;
          })}
        </div>
        <label htmlFor="src" className="sr-only">악보 원문</label>
        <textarea
          id="src"
          ref={textareaRef}
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="grow box-border border-0 resize-none pt-4 pr-5 pb-4 font-mono text-[12.5px] leading-6 text-ink-2 bg-transparent outline-none"
        />
      </div>

      {errorMessage ? (
        <div data-error-strip
          className="shrink-0 flex items-center gap-[11px] p-[12px_20px] border-t border-line-hair bg-danger/7">
          <span className="shrink-0 w-[18px] h-[18px] rounded-xs bg-danger text-[#1A0A08] text-[12px] font-bold flex items-center justify-center">!</span>
          <span className="text-[12.5px] text-danger-text">
            <strong className="font-mono font-bold">{errorLine}행</strong> · {errorMessage}
          </span>
        </div>
      ) : null}
    </section>
  );
}
```

`components/editor/PreviewPane.tsx`:

```tsx
'use client';

import type { Song } from '@/lib/types';
import { Sheet, strumBlocks } from '@/components/sheet/Sheet';
import { StrumGrid, patternName } from '@/components/sheet/StrumGrid';

/** 이번 범위에서는 파싱하지 않는다 — 고정 블록을 그린다.
 *  파서가 붙으면 blocks를 parse(source)로 바꾸는 것이 전부다. */
export function PreviewPane({ song, errorLines = [] }: { song: Song; errorLines?: number[] }) {
  const patterns = strumBlocks(song.blocks);

  return (
    <section className="flex flex-col bg-surface overflow-hidden">
      <div className="shrink-0 h-10 px-7 flex items-center gap-3 border-b border-line-soft">
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-dim">PREVIEW</span>
        <span className="text-[11.5px] text-hairline">입력을 멈추면 0.3초 뒤 갱신</span>
        <span className="ml-auto font-mono text-[11px] text-dim">
          {song.key} · CAPO {song.capo}프렛 · {song.tuning.replace(/\s/g, '')}
        </span>
      </div>

      <div className="grow p-[22px_28px] flex flex-col gap-4 overflow-auto">
        {patterns.map((p, i) => (
          <StrumGrid key={i} name={patternName(i)} use={p.use} slots={p.slots} />
        ))}
        <Sheet blocks={song.blocks} semi={0} fontSize={15} cols={1} errorLines={errorLines} />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: 목 소스와 에디터 조립, 페이지를 만든다**

`lib/mock/editorSample.ts` — 아트보드의 소스 예시 그대로. 24행의 `[Am7`은 **의도적으로 닫히지 않은** 대괄호다(오류 표시 확인용).

```ts
// ⚠ 가상 데이터. docs/design/chordpro-spec.md §2의 예시를 그대로 옮겼다.
export const SAMPLE_SOURCE = `{title: 새벽 두 시의 골목}
{artist: 무렵}
{key: G}
{capo: 2}
{tuning: E A D G B E}
{tempo: 72}

{sos: Intro (첫 G 두 번), Verse 1, Pre-Chorus}
D - D - D U D - D - D - D U - -
>               >
{eos}

{sot: 메인 리프  x3}
E|-------------10------------|
B|--13-11----11----11----11--|
G|-------10----------10------|
D|---------------------------|
A|---------------------------|
E|---------------------------|
{eot}

{soc: Verse 1}
[G]가로등 하나 [Em]꺼지고 남은 자리
[Am7 우린 아직 [D7]여기 앉아 있어
{eoc}`;

/** 파서가 붙기 전까지 쓰는 고정 오류 — 24행 닫히지 않은 대괄호 */
export const SAMPLE_ERROR = {
  line: 24,
  message: '닫히지 않은 대괄호 [Am7 — 이 줄은 코드 없이 가사로만 렌더링됩니다',
  /** 미리보기에서 좌측 danger 바를 그릴 line 블록 인덱스 */
  previewLineIndexes: [1],
};
```

`components/editor/SongEditor.tsx`:

```tsx
'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import type { Song } from '@/lib/types';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { MetaForm } from './MetaForm';
import { InsertToolbar } from './InsertToolbar';
import { SourcePane } from './SourcePane';
import { PreviewPane } from './PreviewPane';
import { Segmented } from '@/components/ui/Segmented';
import { SAMPLE_SOURCE, SAMPLE_ERROR } from '@/lib/mock/editorSample';
import { MOCK_SONGS } from '@/lib/mock/songs';

export function SongEditor({ song }: { song?: Song }) {
  const [source, setSource] = useState(song ? SAMPLE_SOURCE : '');
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preview = song ?? MOCK_SONGS[0];
  const error = source === SAMPLE_SOURCE ? SAMPLE_ERROR : undefined;

  function insert(snippet: string) {
    const el = textareaRef.current;
    if (!el) { setSource((s) => s + snippet); return; }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    setSource(source.slice(0, start) + snippet + source.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  }

  const saveBar = (
    <>
      <Link href={song ? `/songs/${song.slug}` : '/'}
        className="h-[34px] flex items-center px-[14px] border border-line rounded-lg text-ink-4 text-[13px] no-underline">
        취소
      </Link>
      <button type="button"
        className="h-[34px] px-5 border-0 rounded-lg bg-accent text-accent-ink text-[13.5px] font-bold cursor-pointer">
        저장
      </button>
    </>
  );

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <SiteHeader variant="editor" crumb={song ? song.title : 'NEW SONG'} actions={saveBar} />

      {/* 모바일 상단 — 상태바 자리 52px */}
      <header className="md:hidden shrink-0 pt-[52px] px-3 pb-[10px] flex items-center gap-2">
        <Link href={song ? `/songs/${song.slug}` : '/'} className="h-11 flex items-center px-2 text-[14px] text-ink-4 no-underline">취소</Link>
        <span className="grow text-center font-mono text-[11px] tracking-[0.14em] text-ink-5">
          {song ? 'EDIT SONG' : 'NEW SONG'}
        </span>
        <button type="button" className="h-9 px-4 border-0 rounded-md bg-accent text-accent-ink text-[13.5px] font-bold cursor-pointer">저장</button>
      </header>

      <div className="md:hidden px-5 pb-[14px]">
        <Segmented grow value={tab} onChange={(v) => setTab(v as 'write' | 'preview')}
          options={[{ value: 'write', label: '작성' }, { value: 'preview', label: '미리보기' }]} />
      </div>

      <MetaForm song={song} />

      <div className="grow grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className={`${tab === 'write' ? 'flex' : 'hidden'} md:flex flex-col overflow-hidden`}>
          <SourcePane
            value={source} onChange={setSource} textareaRef={textareaRef}
            toolbar={<InsertToolbar onInsert={insert} />}
            errorLine={error?.line} errorMessage={error?.message}
          />
        </div>
        <div className={`${tab === 'preview' ? 'flex' : 'hidden'} md:flex flex-col overflow-hidden`}>
          <PreviewPane song={preview} errorLines={error?.previewLineIndexes ?? []} />
        </div>
      </div>
    </div>
  );
}
```

`app/songs/new/page.tsx`:

```tsx
import { SongEditor } from '@/components/editor/SongEditor';

export default function NewSongPage() {
  return <SongEditor />;
}
```

Run: `npm test -- editor` · 1440px와 390px에서 육안 확인
Expected: 테스트 PASS, 데스크톱 2분할·모바일 탭 전환 동작

- [ ] **Step 5: 커밋**

```bash
git add components/editor lib/mock/editorSample.ts app/songs/new
git commit -m "feat: add song editor with source pane, preview and insert toolbar"
```

---

### Task 17: 남은 경로와 최종 점검

**Files:**
- Create: `app/songs/[slug]/edit/page.tsx`
- Create: `app/tags/[name]/page.tsx`
- Create: `app/not-found.tsx`
- Modify: `docs/design/NOTES.md`
- Test: `app/__tests__/routes.test.tsx`

**Interfaces:**
- Consumes: Task 7 `TrackList` `FilterChips`, Task 16 `SongEditor`, Task 2 `MOCK_SONGS`
- Produces: 없음 (마지막 태스크)

- [ ] **Step 1: 실패 테스트를 쓴다**

`app/__tests__/routes.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import TagPage from '@/app/tags/[name]/page';
import { MOCK_SONGS } from '@/lib/mock/songs';

describe('/tags/[name]', () => {
  it('해당 태그가 달린 곡만 보여준다', async () => {
    const ui = await TagPage({ params: Promise.resolve({ name: encodeURIComponent('발라드') }) });
    render(ui);
    expect(screen.getByRole('link', { name: /우산 없이/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /여름이 길었다/ })).toBeNull();
  });

  it('태그 이름을 제목으로 보여준다', async () => {
    const ui = await TagPage({ params: Promise.resolve({ name: encodeURIComponent('포크') }) });
    render(ui);
    expect(screen.getByRole('heading', { name: /포크/ })).toBeInTheDocument();
  });
});
```

Run: `npm test -- routes`
Expected: FAIL

- [ ] **Step 2: 세 페이지를 만든다**

`app/songs/[slug]/edit/page.tsx` — `/songs/new`와 같은 컴포넌트를 재사용한다.

```tsx
import { notFound } from 'next/navigation';
import { getSong } from '@/lib/mock/songs';
import { SongEditor } from '@/components/editor/SongEditor';

export default async function EditSongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = getSong(decodeURIComponent(slug));
  if (!song) notFound();
  return <SongEditor song={song} />;
}
```

`app/tags/[name]/page.tsx` — `/`의 레이아웃을 재사용한다(히어로 카드 없이).

```tsx
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { TrackList } from '@/components/song/TrackList';
import { MOCK_SONGS } from '@/lib/mock/songs';

export default async function TagPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const tag = decodeURIComponent(name);
  const songs = MOCK_SONGS.filter((s) => s.tags.includes(tag));

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <SiteHeader variant="list" />
      <main className="grow flex flex-col gap-[26px] px-5 md:px-[48px] pt-[56px] md:pt-10 pb-11">
        <div className="flex flex-col gap-[10px]">
          <span className="font-mono text-[11px] tracking-[0.16em] text-accent">{songs.length} SONGS</span>
          <h1 className="m-0 font-display text-[32px] md:text-[46px] font-bold tracking-[-0.03em] leading-none">
            #{tag}
          </h1>
        </div>
        <TrackList songs={songs} />
      </main>
    </div>
  );
}
```

`app/not-found.tsx`:

```tsx
import Link from 'next/link';
import { SiteHeader } from '@/components/chrome/SiteHeader';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <SiteHeader variant="bare" />
      <main className="grow flex flex-col items-center justify-center gap-4 px-5">
        <span className="font-mono text-[11px] tracking-[0.22em] text-accent">NOT FOUND</span>
        <h1 className="m-0 font-display text-[32px] font-bold tracking-[-0.03em]">그 곡은 서랍에 없어요</h1>
        <Link href="/" className="text-[13px] no-underline">← 곡 목록으로</Link>
      </main>
    </div>
  );
}
```

Run: `npm test -- routes`
Expected: PASS

- [ ] **Step 3: 전체 점검 — 테스트·빌드·접근성·반응형**

```bash
npm test
npm run lint
npm run build
```

Expected: 전부 통과

그다음 `npm run dev`로 아래를 **모두** 확인한다. 하나라도 어긋나면 고치고 다시 돈다.

폭 1440px:
- [ ] `/` — 헤더 60px, 좌우 48px, 히어로 카드, 트랙리스트 행 62px, 그리드 컬럼 `36/1fr/64/92/104/84`
- [ ] `/songs/saebyeok-du-siui-golmok` — 좌측 레일 352px, 컨트롤 바 2단, 패턴 카드 2장, 시트 2단
- [ ] 같은 화면에서 집중 모드 → 헤더·레일이 사라지고 컨트롤 바는 남는가
- [ ] 오토스크롤 켜기 → 1단으로 바뀌고 실제로 내려가는가, 끝에서 멈추는가, `2단` 누르면 멈추는가
- [ ] 키 ∓ → 악보 코드와 레일 KEY가 같이 바뀌고 TAB·스트러밍은 그대로인가, 주소에 `?key=+2`가 남는가
- [ ] `/songs/new` — 12컬럼 메타 그리드, 소스/미리보기 2분할, 삽입 툴바, 24행 오류 스트립
- [ ] `/login` — 방사형 글로우 1겹, 밑줄 비밀번호 입력

폭 390px:
- [ ] `/` — 상단 52px 비어 있음, 68px 행, 우하단 FAB 56px
- [ ] `/songs/[slug]` — 하단 독 2단, 메트로놈 켜면 버튼이 박자 숫자를 표시, 첫 박에 앰버
- [ ] `/songs/new` — `작성 | 미리보기` 탭 전환, 삽입 툴바 가로 스크롤
- [ ] 모든 터치 타깃이 44px 이상인가 (DevTools로 측정)

접근성:
- [ ] 아이콘 전용 버튼에 전부 `aria-label`이 있는가
- [ ] 장식 SVG에 전부 `aria-hidden="true"`가 있는가
- [ ] `div` + `onClick`이 하나도 없는가 — `grep -rn "div[^>]*onClick" components app`
- [ ] 키보드 Tab만으로 모든 컨트롤에 닿는가

- [ ] **Step 4: 남은 것을 NOTES.md에 적는다**

`docs/design/NOTES.md`에 덧붙인다:

```markdown
## UI 퍼블리싱 단계에서 남긴 것 (2026-09-23)

- 파서 없음 — 미리보기와 악보는 `lib/mock/`의 고정 블록을 그린다. 파서가 붙으면
  `PreviewPane`의 `song.blocks`를 `parse(source)`로, 상세 페이지의 `getSong()`을
  DB 조회로 바꾸는 것이 연결점 전부다.
- 메트로놈은 시각 박자만 돈다. 소리를 붙일 때 `lib/ui/playView.ts`의 `setInterval`을
  Web Audio 스케줄러로 교체한다(`ponytail:` 주석 위치).
- 테마 전환 버튼은 표시만 한다 — 라이트 모드 토큰이 아직 없다(tokens.css F-10).
- 검색 입력·정렬 셀렉트·필터 칩은 표시 전용이다. FTS5 검색은 탐색 단계에서.
- 로그인 폼은 제출하지 않는다. `lib/mock/flags.ts`의 `IS_ADMIN`으로만 분기한다.
```

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: add tag page, edit route and not-found screen"
```

---

## Self-Review — 계획 작성 후 점검 결과

**1. 스펙 커버리지**

| 정본 위치 | 요구 | 담당 태스크 |
| --- | --- | --- |
| README §1 | 타이포 3역할, 액센트 하나 | Task 1 (토큰) + Global Constraints |
| README §2 | 화면 목록 7개 | Task 6(login) 7(/) 13·14(detail) 16(new) 17(edit·tags) |
| README §3.1 | 목록 헤더·히어로·트랙리스트·모바일 FAB | Task 7 |
| README §3.2 | 레일·컨트롤 바 2단·시트·집중 모드 | Task 11 12 13 |
| README §3.3 | 메타 12컬럼·소스/미리보기·삽입 툴바·오류 | Task 15 16 |
| README §3.4 | 로그인 | Task 6 |
| README §4.1 | 코드-가사 정렬 | Task 1(.gc-pair) + Task 8 |
| README §4.2 | 카포 프렛보드 3크기 | Task 5 (4크기로 확장) |
| README §4.3 | 스트러밍 그리드 16칸 | Task 9 |
| README §4.4 | TAB 블록 | Task 8 |
| README §4.5 | 모바일 하단 독 | Task 14 |
| README §5 | 상호작용 8개 규칙 | Task 10(1·4·5·6) 13(1·7·8) 5(2) 8(3) |
| README §6 | 접근성 | Global Constraints + Task 17 점검 |
| chordpro §4 | 파서 출력 타입 | Task 2 |
| chordpro §5 | 스트러밍 렌더링 | Task 9 |
| chordpro §6 | TAB 보존 | Task 8 |
| chordpro §7 | 이조 | Task 3 |
| chordpro §8·9 | 카포·튜닝 | Task 5 11 15 |
| chordpro §10 | 오류 처리 표시 | Task 16 |

**의도적으로 빠진 것** (범위 경계 참조): 파서(chordpro §1~3), DB 델타(§11), FTS5 검색, 인증, 메트로놈 소리, 라이트 모드 토큰.

**2. 플레이스홀더 점검** — 모든 스텝에 실제 코드가 들어 있다. "적절히 처리" "TBD" "Task N과 비슷하게" 없음. 반복되는 코드는 반복해서 적었다.

**3. 타입 일관성**
- `Block` 유니온 5종은 Task 2에서 한 번 정의하고 Task 8·9·16이 그대로 쓴다. `strum` 블록에 `name` 필드를 두지 않고 렌더러가 `patternName(i)`로 만드는 것으로 통일했다(스펙 §4와 일치).
- `usePlayView` 반환 필드 이름은 Task 10에서 확정하고 Task 12·13·14가 그 이름만 쓴다 (`semi` `fontSize` `cols` `focus` `scrolling` `speedIdx` `speedLabel` `speedPx` `metro` `beat` `bpm` `muted` `sheetRef`).
- `Sheet`는 `containerRef` prop을 받는다 — Task 8의 시그니처에 포함되어 있고 Task 13·14가 스크롤 대상으로 쓴다.
- `Fretboard`의 `size`는 `'rail' | 'hero' | 'bar' | 'row' | 'editor'` 5종으로 Task 5에서 고정, 이후 태스크는 이 문자열만 쓴다.
- `transposeChord(name, semi)` / `keyLabel(semi)` — Task 3에서 확정, Task 11·12·13·14가 쓴다.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-09-23-chordlog-ui-publishing.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — 태스크마다 새 서브에이전트를 붙이고 사이사이 리뷰. 빠른 반복.

**2. Inline Execution** — 이 세션에서 executing-plans로 직접 실행. 체크포인트 단위 일괄 진행.

**Which approach?**
