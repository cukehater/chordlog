# 코드집 — Claude Code 핸드오프 번들

기타 코드 악보 아카이브(1인용) MVP의 디자인 정본. 이 폴더를 레포에 넣고 `CLAUDE.md`에
세 줄만 추가하면, Claude Code가 매번 묻지 않고 같은 디자인·같은 규칙으로 구현합니다.

## 쓰는 법 — 3단계

1. `docs/` 폴더를 레포 루트에 복사합니다.
   ```
   cp -r docs/design <your-repo>/docs/
   ```
2. `CLAUDE.md.snippet.md`의 내용을 레포 루트 `CLAUDE.md`에 붙여넣습니다.
3. Claude Code에서 첫 작업을 이렇게 시작합니다.
   ```
   docs/design/README.md와 docs/design/tokens.css를 먼저 읽어줘.
   그다음 §3.2 곡 상세·연주 뷰를 Next.js App Router + Tailwind로 구현해줘.
   악보 렌더링은 docs/design/chordpro-spec.md를 따르고,
   파서는 lib/chordpro/에 DB와 무관한 순수 함수로 만들어줘.
   ```

## 들어 있는 것

```
docs/design/
  README.md              화면별 레이아웃·컴포넌트·상호작용 사양  ← 정본
  tokens.css             색·타이포·radius (CSS 변수 + Tailwind 매핑)
  chordpro-spec.md       악보 포맷, 이조·카포·TAB·스트러밍 도메인 로직
  artboards/
    README.md            .dc.html 읽는 법
    *.dc.html            아트보드 원본 7장 (수치 추출용)
    canvas.json          기준 캔버스 크기
    standalone/*.html    브라우저에서 바로 열리는 정적 화면 5장
CLAUDE.md.snippet.md     CLAUDE.md에 붙여넣을 조각
```

## 정본의 우선순위

1. `tokens.css` — 색·폰트·radius는 여기가 유일한 출처
2. `README.md` — 레이아웃과 동작 규칙
3. `chordpro-spec.md` — 도메인 로직
4. `artboards/` — 위 셋으로 알 수 없는 세부 수치를 확인할 때

**스크린샷이 아니라 이 텍스트들이 정본입니다.** 이미지에서 색을 추정하는 것보다
`--gc-accent: #FF9D4D`와 "오토스크롤을 켜면 1단으로 강제 전환" 같은 문장이 훨씬 정확하게
재현됩니다. 화면 이미지가 필요하면 캔버스에서 아트보드를 이미지로 내보내 `screens/`에
넣되, 참고 자료로만 쓰세요.

## 들어 있지 않은 것 (의도적으로)

- **실제 곡 데이터** — 시안의 `새벽 두 시의 골목 / 무렵`과 가사·TAB은 저작권 문제를 피하려고
  지어낸 것입니다. 시드로 쓰지 말고 실제 채보로 교체하세요.
- **라이트 모드 토큰** — 현재는 다크 기준만 있습니다(F-10 남은 작업).
- **`/tags/[name]` 화면** — `/`의 레이아웃을 재사용하면 됩니다.
- **컴포넌트 코드** — 의도적으로 넣지 않았습니다. `.dc.html`은 캔버스 포맷이라 그대로 쓰면
  오히려 손해입니다. 스펙을 읽고 프로젝트 관례에 맞게 새로 쓰는 편이 빠릅니다.

## 구현 순서 제안

기존 기획서의 마일스톤을 그대로 따르되, 파서를 먼저 끝내는 것이 핵심입니다.

1. **파서** (`lib/chordpro/`) — 파싱·이조·스트러밍·TAB 블록 + 단위 테스트. DB 없이 순수 함수로.
2. **읽기** — 목록, 곡 상세, 연주 뷰 컨트롤 바. 시드 데이터로 동작 확인.
3. **쓰기** — 로그인, 작성/편집, 실시간 미리보기, 삽입 툴바.
4. **연습 도구** — 오토스크롤, 메트로놈(Web Audio 스케줄러), 집중 모드.
5. **탐색** — FTS 검색(한글 trigram), 태그, 상태 필터.

1번이 끝나면 나머지는 그 결과를 보여주는 평범한 CRUD입니다.
