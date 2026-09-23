# CLAUDE.md에 붙여넣을 조각

레포 루트의 `CLAUDE.md`에 아래를 그대로 추가하세요. 이 몇 줄이 있어야 Claude Code가
매번 물어보지 않고 디자인 정본을 먼저 읽습니다.

---

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
```
