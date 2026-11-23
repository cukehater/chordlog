## 디자인

UI 작업(새 화면, 컴포넌트, 스타일 수정) 전에 반드시 읽을 것:

- `docs/design/README.md` — 화면별 레이아웃·컴포넌트·상호작용 사양
- `docs/design/tokens.css` — 색·타이포·radius 정본. 새 hex를 만들지 말고 여기 변수를 쓸 것
- `docs/design/chordpro-spec.md` — 악보 포맷과 도메인 로직(이조·카포·TAB·스트러밍)

`docs/design/artboards/`는 디자인 캔버스 전용 포맷(`.dc.html`)이다. 수치를 읽어가는
참고용이며 그대로 복사해 쓰지 않는다. 브라우저에서 바로 볼 수 있는 4개 화면은
`docs/design/artboards/standalone/`에 있다.

시각 규칙의 정본은 루트 `DESIGN.md`다(2026-11-23 리디자인: 랜딩 산출물 톤 기준, 어두운 로즈우드 바탕 + 앰버 하나).
README의 색·폰트 서술은 이전 디자인이라 `DESIGN.md`가 이긴다. 랜딩 시안 원본은 `docs/design/landing/`(git 제외, 참고용)이다.
서비스명은 Chordlog(가칭)이고 `lib/site.ts` 한 곳에서 바꾼다.

규칙:
- 액센트 색은 `--color-accent`(앰버 #F0A04B) 하나뿐이다. 두 번째 액센트를 도입하지 말 것
- 한글은 IBM Plex Sans KR 한 가족. Fraunces는 워드마크·랜딩 타이틀 같은 라틴 표시용만, IBM Plex Mono는 TAB·튜닝 글자처럼 폭 정렬이 필요한 곳만
- 그라데이션·블러·번짐 그림자는 랜딩(`components/landing/`)에만. 앱 화면은 독·FAB 외에 그림자를 쓰지 않는다
- 모바일 터치 타깃 최소 44px, 아이콘 버튼에 aria-label 필수
- `body`는 언제나 원키 기준. 이조·카포 결과를 저장하지 않는다
- TAB과 스트러밍 패턴은 이조 대상이 아니다
- 시안의 곡·가사·TAB은 전부 가상 데이터다. 시드로 쓰지 말 것

## 구현 범위 (2026-09-23 기준)

지금은 UI 퍼블리싱 단계다. 파서·DB·인증·메트로놈 소리는 만들지 않는다.
데이터는 `lib/mock/`에서만 온다. 경계는
`docs/superpowers/plans/2026-09-23-chordlog-ui-publishing.md`의 "범위 경계"를 읽을 것.

## 패키지 매니저

이 레포는 **pnpm**을 쓴다(`package.json`의 `packageManager`에 버전 고정).

- 설치: `pnpm install`. **`npm install` / `npm ci`를 돌리지 마라** — `package-lock.json`이 되살아나 전환이 깨진다.
- 스크립트: `pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm test`
- `docs/superpowers/plans/`의 npm 명령은 전환 이전에 실제로 실행된 기록이라 그대로 둔다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
