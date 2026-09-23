# 아트보드 원본 읽는 법

이 폴더의 `*.dc.html`은 **디자인 캔버스 전용 포맷**입니다. 값을 정확히 읽어가는 용도이지,
그대로 React 컴포넌트로 복사하는 코드가 아닙니다.

## 무엇이 평범한 HTML이고 무엇이 아닌가

| 문법 | 의미 | 구현할 때 |
| --- | --- | --- |
| `style="..."` (인라인) | 모든 스타일이 인라인입니다 | **수치를 여기서 그대로 가져오세요.** padding, font-size, gap, radius 전부 실제 값 |
| `{{name}}` | 값 바인딩 | 파일 하단 `class Component`의 `renderVals()`가 돌려주는 값 |
| `<sc-for list="{{xs}}" as="x">` | 반복 | `xs.map(...)` |
| `<sc-if value="{{flag}}">` | 분기 | 조건부 렌더링 |
| `<helmet><style>` | 페이지 기본 스타일 | 전역 CSS로 (`tokens.css`에 이미 반영됨) |
| `<script src="./support.js">` | 캔버스 런타임 | **버리세요.** 실제 앱과 무관 |
| `data-props='{"accent":...}'` | 캔버스 편집기용 색 조절 레버 | 버리세요. 실제 값은 `--gc-accent` |
| `class Component extends DCLogic` | 아트보드 로직 | `useState` 기반 컴포넌트로 옮기면 됩니다 |

`renderVals()` 안의 **로직은 그대로 쓸 만합니다** — 특히 `SongDetail.dc.html`의 `tr()`(이조),
`pattern()`(스트러밍 슬롯 생성), `tab()`(TAB 블록), 그리고 오토스크롤·메트로놈 타이머가
그렇습니다. 메트로놈만은 `setInterval` 대신 Web Audio 스케줄러로 바꾸세요
(`chordpro-spec.md` §7 위쪽, `README.md` §5-5 참고).

## standalone/

브라우저에서 바로 열리는 정적 HTML입니다. 캔버스 런타임을 벗기고 `{{accent}}`를 실제 값으로
치환해서 만들었습니다 — **디자인 확인용**이며, 여기서도 코드를 복사하지 마세요.

- `Main.html` — 곡 목록 (1440)
- `Editor.html` — 작성·편집 (1440)
- `Login.html` — 로그인 (1440)
- `MobileList.html` — 모바일 목록 (390)
- `MobileEditor.html` — 모바일 작성 (390)

`SongDetail`과 `MobilePlay`는 **내용의 대부분이 데이터 바인딩과 상태**(이조·오토스크롤·
메트로놈)라서 정적 HTML로 뽑으면 빈 화면이 됩니다. 이 두 장은 캔버스에서 Play로 열어
실제 동작을 보거나, `.dc.html` 원본의 `renderVals()`를 읽으세요.

## canvas.json

아트보드의 캔버스 배치 정보(좌표·크기·제목)입니다. 각 화면의 **기준 캔버스 크기**를
확인할 때만 쓰세요. 예: `SongDetail` 1440×1300, 모바일 390×844.
