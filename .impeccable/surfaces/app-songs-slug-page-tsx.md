---
version: 1
slug: "app-songs-slug-page-tsx"
primary_target: "app/songs/[slug]/page.tsx"
related_targets: ["components/play/SongDetailView.tsx"]
---

# 곡 상세 · 연주 뷰 (`/songs/[slug]`)

- 모드: Operate. 본인이 책상 모니터 앞에서 기타를 들고 이 화면을 보며 연주한다.
- 과업: 곡을 열고 바로 연주 시작. 키 바꾸기, 카포 확인, 오토스크롤·메트로놈을 켠 채 끝까지.
- 유지할 기능: 이조(?key URL), 카포·튜닝 표시, 스트러밍 패턴 A/B, TAB, 연습 메모·원본 링크, 글자 크기, 1단/2단, 집중 모드(헤더·곡 정보만 숨기고 툴바는 남김), 모바일 하단 독.
- 넣지 않을 것: 시안 스케치에 있던 세트리스트·공유·코드 운지 다이어그램은 제품에 없는 기능이라 만들지 않는다.

## Direction contract

THESIS: 코드 악보 서비스의 표준 화면을 장난 없이 최고 수준으로 만든다. 다크 바탕 + 단일 네온 액센트 + 모노 라벨이라는 이전 디자인과 그 유행을 거부한다.

OWN-WORLD: 흰 바탕(#FFFFFF), 본문 #1F2937, 보조 #6B7280, 회색 면 #F3F4F6, 선 #E5E7EB, 파랑 #2563EB 하나가 코드 글자·주요 버튼·켜진 상태를 맡는다. Noto Sans KR 한 가족으로 제목·본문·코드를 모두 쓰고, TAB만 Noto Sans Mono. 모서리 6–10px, 그림자 없이 1px 선과 회색 면으로 구분.

STORY: 곡을 열면 제목·아티스트·키/카포/튜닝/BPM 칩이 보이고, 그 아래 고정 툴바로 이조·오토스크롤·글자·단·메트로놈을 조작하며, 흰 바탕의 파란 코드 악보를 읽으며 연주한다.

FIRST VIEWPORT: 60px 상단 내비(워드마크, 검색, 새 곡) → 곡 머리(경로, 28px 제목, by 아티스트, 메타 칩 줄, 우측 편집) → 56px 툴바(TRANSPOSE −/키/+ · AUTOSCROLL 토글+속도 · FONT · 1단/2단 · METRONOME ▶/BPM/TAP · 집중 모드) → 본문: 좌 악보(코드는 파랑 굵게 가사 위, 섹션은 회색 [Verse 1]) / 우 300px 카드(카포, 스트러밍 A·B, 연습 메모).

FORM: 카테고리 표준(canon), 결정 라운드의 standing exit. seed:723ed894dc7be3c1

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
